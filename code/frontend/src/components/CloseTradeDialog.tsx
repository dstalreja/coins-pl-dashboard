import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Check } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { API_BASE_URL } from "../config";
import { Trade } from "../types";

const formSchema = z.object({
    closePrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface CloseTradeDialogProps {
    trade: Trade;
    onTradeClosed: () => void;
}

export function CloseTradeDialog({ trade, onTradeClosed }: CloseTradeDialogProps) {
    const [open, setOpen] = useState(false);
    const { token, logout } = useAuth();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            closePrice: trade.livePrice || trade.entryPrice,
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/close-trade`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    trade_id: trade.id,
                    close_price: values.closePrice,
                }),
            });

            if (res.status === 401) {
                logout();
                setOpen(false);
                alert("Session expired. Please sign in again.");
                return;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to close trade");
            }

            setOpen(false);
            onTradeClosed();
        } catch (error) {
            console.error("Error closing trade:", error);
            alert("Failed to close trade. See console.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors" title="Close Trade">
                    <Check className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-border">
                <DialogHeader>
                    <DialogTitle>Close Trade: {trade.ticker}</DialogTitle>
                    <DialogDescription>
                        Confirm closing price for {trade.shares} shares.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="closePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Closing Price ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4 space-x-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Confirm Close
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
