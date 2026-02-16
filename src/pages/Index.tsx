import { Navigate } from 'react-router-dom';
import { ENABLE_AUTH } from '@/config/flags';

const Index = () => {
  return <Navigate to={ENABLE_AUTH ? "/auth" : "/onboarding"} replace />;
};

export default Index;
