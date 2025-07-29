import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface TransactionRecord {
  id?: string
  userId: string
  walletAddress: string
  type: "mint" | "transfer"
  tokenId?: string
  nftName?: string
  transactionHash: string
  blockNumber: number
  gasUsed: string
  from?: string
  to?: string
  timestamp: any
  status: "pending" | "confirmed" | "failed"
}

// Lưu transaction vào Firestore
export const saveTransaction = async (transaction: Omit<TransactionRecord, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...transaction,
      timestamp: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving transaction:", error)
    throw error
  }
}

// Lấy lịch sử giao dịch của user
export const getTransactionHistory = async (userId: string, walletAddress?: string) => {
  try {
    let q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("timestamp", "desc"))

    // Nếu có walletAddress, filter thêm
    if (walletAddress) {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("walletAddress", "==", walletAddress),
        orderBy("timestamp", "desc"),
      )
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TransactionRecord[]
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    throw new Error("Không thể tải lịch sử giao dịch")
  }
}

// Cập nhật trạng thái transaction
export const updateTransactionStatus = async (transactionId: string, status: "pending" | "confirmed" | "failed") => {
  try {
    const { doc, updateDoc } = await import("firebase/firestore") // Dynamic import doc, updateDoc

    const txRef = doc(db, "transactions", transactionId)
    await updateDoc(txRef, { status })
  } catch (error) {
    console.error("Error updating transaction status:", error)
    throw error
  }
}

// Lấy thống kê giao dịch
export const getTransactionStats = async (userId: string) => {
  try {
    const transactions = await getTransactionHistory(userId)

    const stats = {
      totalTransactions: transactions.length,
      mintCount: transactions.filter((tx) => tx.type === "mint").length,
      transferCount: transactions.filter((tx) => tx.type === "transfer").length,
      confirmedCount: transactions.filter((tx) => tx.status === "confirmed").length,
      pendingCount: transactions.filter((tx) => tx.status === "pending").length,
      failedCount: transactions.filter((tx) => tx.status === "failed").length,
    }

    return stats
  } catch (error) {
    console.error("Error getting transaction stats:", error)
    throw error
  }
}
