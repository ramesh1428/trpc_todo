import { z } from 'zod';
import { procedure, router } from '../trpc';
import { PrismaClient, Role } from '@prisma/client';
import { User } from '@clerk/nextjs/server';

enum RoleStatus {
    ENABLE='Enable',
    DISABLE='Disable'
} 

const prisma = new PrismaClient();
export const appRouter = router({

getTodo: procedure.query(async ({ctx}) => {
    let user = (ctx as {user: User});
    const user_id = user.user.id
    const get_user = await prisma.user.findFirst(
        {
            where: {
                id:user_id
            }
        }
        );
    const todos = await prisma.todo.findMany();
    const delete_enable = get_user?.role === Role.ADMIN ? RoleStatus.ENABLE : RoleStatus.DISABLE
    return {todos,delete_enable}  
}),

createTodo: procedure
    .input(z.object({ task: z.string() }))
    .mutation(async ({ input,ctx }) => {
      const { task } = input;
      let user = (ctx as {user: User});
      const user_id = user.user.id
      const newTodo = await prisma.todo.create({
        data: { task,userId:user_id },
      });
      return { newTodo };
    }),
deleteTodo: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const deletedTodo = await prisma.todo.delete({
        where: { id },
      });
      return { deletedTodo };
    }),

updateTodo: procedure
    .input(
      z.object({
        id: z.number(),
        task: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, task } = input;
      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: { task },
      });
      return { updatedTodo };
    }),

    hello: procedure.query(({ctx}) => {
        console.log('from app router');
        let mynewtype = (ctx as {user: User});
        console.log(mynewtype.user);
    }),

    createUser: procedure
  .mutation(async ({ ctx }) => {
    let mynewtype = (ctx as {user: User});
    const { id, firstName, emailAddresses, createdAt, updatedAt } = mynewtype.user;

    // Assuming there can be multiple email addresses, you might want to choose one
    const primaryEmailAddress = emailAddresses.find((ea) => ea.verification?.[0]?.verified) || emailAddresses[0];

    const newUser = await prisma.user.create({
      data: {
        id,
        name: firstName ?? 'Null', // Assuming firstName is the equivalent of user_name
        email: primaryEmailAddress.emailAddress,
        createdAt: new Date(createdAt), // Convert timestamp to Date
        updatedAt: new Date(updatedAt), // Convert timestamp to Date
        role: Role.USER
        // Other properties...
      },
    });

    return { newUser };
  }),
    
});
// export type definition of API
export type AppRouter = typeof appRouter;