import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private walletService: WalletService,
  ) {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, displayName } = registerDto;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });

      // Generate wallet for user
      const wallet = await this.walletService.generateWallet();

      // Save user data to Firestore
      const userData = {
        uid: userRecord.uid,
        email,
        displayName: displayName || email.split('@')[0],
        walletAddress: wallet.address,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set(userData);

      // Save wallet data securely
      await this.walletService.saveWallet(userRecord.uid, wallet);

      // Generate JWT token
      const payload = { 
        sub: userRecord.uid, 
        email: userRecord.email,
        walletAddress: wallet.address,
      };
      
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userData.displayName,
          walletAddress: wallet.address,
        },
        accessToken,
      };
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Get user by email from Firebase
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Get user data from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }

      const userData = userDoc.data();

      // Verify password (Note: Firebase Admin SDK doesn't provide password verification)
      // We'll need to implement custom password verification or use Firebase Auth REST API
      // For now, we'll use Firebase Auth REST API to verify credentials
      const isValidPassword = await this.verifyPassword(email, password);
      
      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload = { 
        sub: userRecord.uid, 
        email: userRecord.email,
        walletAddress: userData.walletAddress,
      };
      
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userData.displayName,
          walletAddress: userData.walletAddress,
        },
        accessToken,
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async validateUser(payload: any) {
    try {
      const userRecord = await admin.auth().getUser(payload.sub);
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .get();

      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userData.displayName,
        walletAddress: userData.walletAddress,
      };
    } catch (error) {
      return null;
    }
  }

  private async verifyPassword(email: string, password: string): Promise<boolean> {
    // Use Firebase Auth REST API to verify password
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase API key not configured');
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
