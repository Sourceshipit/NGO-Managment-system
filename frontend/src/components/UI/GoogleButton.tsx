import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/client';

export default function GoogleButton() {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google sign-in failed: no credential returned');
      return;
    }
    try {
      const data = await authAPI.googleLogin(credentialResponse.credential);
      login(data.access_token, data.user);
      toast.success('Signed in with Google!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Google sign-in failed');
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="w-full border-2 border-black shadow-[4px_4px_0px_0px_#000]
        hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px]
        hover:translate-y-[2px] transition-all overflow-hidden">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error('Google sign-in failed')}
          width="100%"
          text="signin_with"
          shape="square"
          theme="outline"
        />
      </div>
    </div>
  );
}
