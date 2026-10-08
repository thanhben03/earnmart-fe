import React from 'react';
import { router } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { BlockingScreen } from '../src/components/auth/BlockingScreen';
export default function MaintenanceScreen() { const { message, retryBootstrap } = useAuth(); return <BlockingScreen title="EarnMart đang bảo trì" message={message || 'Hệ thống đang bảo trì. Vui lòng thử lại sau.'} actionLabel="Thử lại" onAction={async () => { await retryBootstrap(); router.replace('/'); }} />; }

