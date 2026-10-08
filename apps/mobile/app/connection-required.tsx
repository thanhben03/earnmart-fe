import React from 'react';
import { router } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { BlockingScreen } from '../src/components/auth/BlockingScreen';
export default function ConnectionRequiredScreen() { const { message, retryBootstrap } = useAuth(); return <BlockingScreen title="Cần kết nối mạng" message={message || 'EarnMart cần kết nối máy chủ để xác minh phiên đăng nhập.'} actionLabel="Thử lại" onAction={async () => { await retryBootstrap(); router.replace('/'); }} />; }

