import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { AuthOptions } from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import { db } from "./db";
import { fetchRedis } from "@/helpers/redis";




export const authOptions: AuthOptions = {
    // @ts-ignore
    adapter : UpstashRedisAdapter(db),
    providers : [
        GoogleProvider({
            clientId : process.env.GOOGLE_CLIENT_ID!,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    session : {
        strategy : 'jwt'
    },
    pages : {
        signIn : '/login'
    },
    callbacks : {
        async jwt({token, user}){
          const dbUserResult = await fetchRedis('get', `user:${token.id}`) as  string | null
          if(!dbUserResult){
            if(user){
                token.id = user!.id;
                
            }
            return token;
        }
        const dbUser = JSON.parse(dbUserResult) as User
          return {
            id : dbUser.id,
            name : dbUser.name,
            email : dbUser.email,
            picture : dbUser.image
          }
        },

        async session({session, token}){
            if(token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture
            }

            return session;
        },
        redirect() {
            return '/dashboard'
        }
    }
}

