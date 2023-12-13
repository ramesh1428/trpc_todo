import "@/styles/globals.css";
// import type { AppProps } from 'next/app'

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }
import { useEffect } from "react";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { ClerkProvider } from "@clerk/nextjs";
import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const MyApp: AppType = ({ Component, pageProps }) => {
  const create_user = trpc.createUser.useMutation();

  useEffect(() => {
    const handleSignIn = async () => {
      // Trigger the user creation mutation when the user signs in
      try {
        await create_user.mutate();
      } catch (error) {
        console.error("Error creating user as user already exist:", error);
      }
    };

    // Call the handleSignIn function when the component mounts
    handleSignIn();
  }, []);
  return (
    <ClerkProvider>
      <SignedIn>
        <UserButton />
      <Component {...pageProps} />
      {create_user.isLoading && <div>Loading...</div>}

      {create_user.isSuccess && (
        <div>
          {/* Render content based on mutation success */}
          User created successfully!
        </div>
      )}
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </ClerkProvider>
  );
};

export default trpc.withTRPC(MyApp);
