import { Link as LinkIcon, Eye, Edit2, Ban, Trash2, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomForm } from "@/api/rsvps";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface FormCardProps {
  form: CustomForm;
  workspaceSlug: string;
  onToggleActive: (form: CustomForm) => void;
  onDeleteClick: (form: CustomForm) => void;
  isToggling: boolean;
}

export function FormCard({
  form,
  workspaceSlug,
  onToggleActive,
  onDeleteClick,
  isToggling,
}: FormCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="group rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
      onClick={() =>
        navigate({
          to: "/dashboard/$workspaceSlug/rsvps/$formId",
          params: {
            workspaceSlug,
            formId: form.id,
          },
        })
      }
    >
      <div className="h-32 w-full bg-secondary relative overflow-hidden">
        <img
          src={form.cover_image_url || "/default-form-cover.png"}
          alt={form.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              form.is_active
                ? "bg-green-500/90 text-white backdrop-blur-sm shadow-sm"
                : "bg-secondary/90 text-muted-foreground backdrop-blur-sm"
            }`}
          >
            {form.is_active ? "Active" : "Closed"}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {form.title}
          </h3>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-1 -mr-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48">
                <DropdownMenuItem
                  onSelect={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`);
                    toast.success("Public link copied to clipboard");
                  }}
                >
                  <LinkIcon className="mr-2 h-4 w-4" /> Copy Public Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    navigate({
                      to: "/dashboard/$workspaceSlug/rsvps/$formId",
                      params: { workspaceSlug, formId: form.id },
                    });
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View RSVPs
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    navigate({
                      to: "/dashboard/$workspaceSlug/rsvps/edit/$formId",
                      params: { workspaceSlug, formId: form.id },
                    });
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Form
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  onSelect={() => {
                    onToggleActive(form);
                  }}
                  disabled={isToggling}
                >
                  <Ban className="mr-2 h-4 w-4" /> {form.is_active ? "Close Form" : "Open Form"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  onSelect={() => {
                    onDeleteClick(form);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Form
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {form.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
          <div className="flex items-center text-sm font-medium">
            <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
            {form.rsvps?.length || 0} RSVPs
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(form.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
