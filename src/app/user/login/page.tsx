"use client"

import { z } from "zod"
import { useAuthStore } from "@/store/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import { TypingAnimation } from "@/components/utils/type-animation";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingButton } from "@/components/utils/button";
import { useState } from "react";

const formSchema = z.object({
    username: z.string().min(2).max(20),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be at most 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (e.g., !@#$%)")
})

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useIsMobile();
    const router = useRouter()
    const { login } = useAuthStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await login(values.username, values.password);
            router.push("/")
        } catch (e) {
            form.setError("root", {
                message: "Invalid username or password"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const message = "Hello! Welcome back to Dafifi — pick up right where you left off and continue creating amazing things with our powerful tools!";

    return (
        <div className="flex h-screen w-full">
            {!isMobile && (
                <div className="drop-shadow-md w-3/4 bg-gradient-to-r from-sky-800 to-sky-500">
                    <div className="h-[60%] flex items-center">
                        <TypingAnimation
                            text={message}
                        />
                    </div>
                </div>
            )}
            <div className="flex items-center justify-center w-full md:w-1/4">
                <div className="max-w-md">
                    <div className="text-3xl font-bold">Login to Dafifi</div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8 w-full my-4">
                            < FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            < FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <LoadingButton
                                isLoading={isLoading}
                                className="bg-sky-500 text-foreground w-full"
                                type="submit"
                            >
                                Login
                            </LoadingButton>
                        </form >
                    </Form >
                </div>
            </div>
        </div>
    )
}