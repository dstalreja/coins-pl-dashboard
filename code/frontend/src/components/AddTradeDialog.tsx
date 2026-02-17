import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { API_BASE_URL } from "../config";

// Schema for form validation
const formSchema = z.object({
    ticker: z.string().min(1, "Ticker is required").transform((val) => val.toUpperCase()),
    entryPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
    shares: z.coerce.number().min(0.01, "Shares must be greater than 0"),
    positionType: z.enum(["OW", "UW"] as const, {
        required_error: "Please select a position type",
    }),
    positionAmount: z.coerce.number().min(0, "Amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTradeDialogProps {
    onTradeAdded: () => void;
}

export function AddTradeDialog({ onTradeAdded }: AddTradeDialogProps) {
    const [open, setOpen] = useState(false);
    const { token } = useAuth();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ticker: "",
            entryPrice: 0,
            shares: 0,
            positionType: "OW",
            positionAmount: 0,
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const res = await fetch(`${API_BASE_URL}/add-trade`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Pass Google Token
                },
                body: JSON.stringify({
                    ticker: values.ticker,
                    entry_price: values.entryPrice,
                    shares: values.shares,
                    position_type: values.positionType,
                    position_amount: values.positionAmount,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to add trade");
            }

            form.reset();
            setOpen(false);
            onTradeAdded();
        } catch (error) {
            console.error("Error adding trade:", error);
            alert("Failed to add trade. See console.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border-0">
                    <Plus className="h-4 w-4" />
                    New Trade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-border">
                <DialogHeader>
                    <DialogTitle>Add New Trade</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new position.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ticker"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ticker</FormLabel>
                                    <FormControl>
                                        <Input placeholder="AAPL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="entryPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entry Price ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shares"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shares</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="any" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="positionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="OW">Overweight (OW)</SelectItem>
                                                <SelectItem value="UW">Underweight (UW)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="positionAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight %</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Add Trade
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
