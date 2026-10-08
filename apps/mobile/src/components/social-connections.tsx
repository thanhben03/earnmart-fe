import { Button } from '@/components/rnr-ui/button';
import { Text } from '@/components/rnr-ui/text';
import { ActivityIndicator, Image } from 'react-native';

type SocialConnectionsProps = {
  disabled?: boolean;
  loading?: boolean;
  onGooglePress: () => void;
};

export function SocialConnections({
  disabled = false,
  loading = false,
  onGooglePress,
}: SocialConnectionsProps) {
  return (
    <Button
      accessibilityLabel="Đăng nhập với Google"
      disabled={disabled}
      variant="outline"
      className="w-full"
      onPress={onGooglePress}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#475569" />
      ) : (
        <>
          <Image
            accessibilityIgnoresInvertColors
            className="size-4"
            source={{ uri: 'https://img.clerk.com/static/google.png?width=160' }}
          />
          <Text>Tiếp tục với Google</Text>
        </>
      )}
    </Button>
  );
}
