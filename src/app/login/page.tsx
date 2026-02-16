import { BasketballLogin } from "@/components/auth/basketball-login";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.ReactElement> {
  const params = await searchParams;

  return <BasketballLogin error={params.error} />;
}
