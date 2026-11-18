"use client";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Interactive overlay samples for the internal UI reference page. */
function OverlayDemo() {
  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>نمونه‌ی دیالوگ</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ذخیره‌ی مطلب</DialogTitle>
              <DialogDescription>
                «منار جام» به فهرست ذخیره‌های شما افزوده می‌شود تا بعداً آن را بخوانید.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>انصراف</DialogClose>
              <DialogClose render={<Button />}>ذخیره</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon" aria-label="گزینه‌های بیشتر" />}
          >
            <EllipsisHorizontalIcon aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>این مطلب</DropdownMenuLabel>
              <DropdownMenuItem>هم‌رسانی</DropdownMenuItem>
              <DropdownMenuItem>ذخیره</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">گزارش مشکل</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" />}>راهنمای کوتاه</TooltipTrigger>
          <TooltipContent>ولایت هرات، غرب افغانستان</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export { OverlayDemo };
