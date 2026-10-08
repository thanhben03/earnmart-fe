import React from 'react';
import { useAuth } from '../src/auth/AuthProvider';
import { BlockingScreen } from '../src/components/auth/BlockingScreen';
export default function AccountBlockedScreen() { const { message } = useAuth(); return <BlockingScreen title="Không thể truy cập tài khoản" message={message || 'Tài khoản đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ bộ phận hỗ trợ.'} />; }
