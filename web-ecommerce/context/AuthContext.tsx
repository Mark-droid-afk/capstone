"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            let u = await validate();
            if (!u) {
                const refreshed = await refresh();
                if (refreshed) u = await validate();
            }
            setUser(u);
            setIsLoading(false);
        };
        init();
    }, []);

    const validate = async (): Promise<User | null> => {
        try {
            const res = await apiAuth.get("/api/customer-auth/validate");
            return res.data.customer;
        } catch {
            return null;
        }
    };

    const refresh = async (): Promise<boolean> => {
        try {
            await apiAuth.post("/api/customer-auth/refresh");
            return true;
        } catch {
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await apiAuth.post("/api/customer-auth/logout");
        } finally {
            setUser(null);
            router.push("/signin");
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};