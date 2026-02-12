import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LoginButton } from "@/components/auth/login-button";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-fb-galaxy p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold tracking-tight text-fb-galaxy">
              Fastbreak
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Accelerate Your Game
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                Authentication failed. Please try again.
              </div>
            )}
            <LoginButton />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-neutral-400">
          Powered by Fastbreak AI
        </p>
      </div>
    </div>
  );
}
