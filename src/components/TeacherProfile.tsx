import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Edit2 } from "lucide-react";

interface TeacherProfileCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    actionButton?: React.ReactNode;
}

export function TeacherProfileCard({ 
    title, 
    children, 
    onEdit, 
    actionButton 
}: TeacherProfileCardProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <div className="flex items-center gap-2">
                    {actionButton && actionButton}
                    {onEdit && (
                        <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
};