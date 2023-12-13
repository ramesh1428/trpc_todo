// Import necessary modules and functions
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { AuthObject,User,getAuth } from '@clerk/nextjs/server';
import { appRouter } from '../../../server/routers/_app';
import { clerkClient } from '@clerk/nextjs';

// Interface for the AuthContext
interface AuthContext {
  userId: string; // Add userId property to AuthContext
  sessionId: string;
}

// createContextInner function
const createContextInner = async (opts: AuthContext) => {
  console.log('check auth')
  console.log('AuthContext:', opts);
  return opts; // Return entire AuthContext
};

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async (opts) => {
    // console.log(opts);
    // console.log(opts.res);
    const userAuth = getAuth(opts.req); // Get user ID from 
    let user = null;
    if (!userAuth.userId) {
      return 
    }
    user = await clerkClient.users.getUser(userAuth.userId);
    console.log(user.gender,user.birthday);

    const auth: AuthContext = await createContextInner({userId: userAuth.userId, sessionId: userAuth.sessionId});
    return { auth, user };
  },
});
