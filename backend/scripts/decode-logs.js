// Decode base64 logs from Autotask response
const encodedLogs = 'QVVUT1RBU0sgU1RBUlQKMjAyNS0wOC0wMVQwNzozNzozMC42NTVaCUVSUk9SCUVycm9yIG1pbnRpbmcgTkZUOgpFTkQgUmVxdWVzdElkOiA0ZDBiOGU0ZS0xMmVhLTQwZDQtYTQ4OC04ZGU4MzkyMzQ2OTIKQVVUT1RBU0sgQ09NUExFVEU=';

const decodedLogs = Buffer.from(encodedLogs, 'base64').toString('utf8');
console.log('📋 Decoded Autotask Logs:');
console.log('─'.repeat(50));
console.log(decodedLogs);
console.log('─'.repeat(50));
