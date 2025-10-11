import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center font-headline text-5xl font-bold text-primary">
          Duet
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          A private space for you and your favorite person.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
