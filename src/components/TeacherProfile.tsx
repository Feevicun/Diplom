import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Edit2 } from "lucide-react";

interface TeacherProfileCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
}

export function TeacherProfileCard({ title, children, onEdit }: TeacherProfileCardProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {onEdit && (
                    <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
};