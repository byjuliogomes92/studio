"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { PanelLeft } from "lucide-react"

type SidebarContextType = {
  state: "expanded" | "collapsed"
  toggle: () => void
  isMobile: boolean
  isOpenMobile: boolean
  setIsOpenMobile: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<"expanded" | "collapsed">("expanded")
  const [isOpenMobile, setIsOpenMobile] = React.useState(false)
  const isMobile = useIsMobile()

  const toggle = () => {
    setState(prevState => (prevState === "expanded" ? "collapsed" : "expanded"))
  }

  React.useEffect(() => {
    if (isMobile) {
      setState("collapsed")
    } else {
      setState("expanded")
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ state, toggle, isMobile, isOpenMobile, setIsOpenMobile }}>
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state, isMobile, isOpenMobile, setIsOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={isOpenMobile} onOpenChange={setIsOpenMobile}>
        <SheetContent side="left" className="p-0 w-72">
          <div ref={ref} className={cn("flex h-full flex-col", className)} {...props} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "hidden md:flex h-screen flex-col border-r bg-card text-card-foreground transition-all duration-300 ease-in-out",
        state === "expanded" ? "w-64" : "w-16",
        className
      )}
      data-state={state}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { state } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn("flex h-16 items-center border-b px-3", state === 'collapsed' && 'justify-center', className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

export const SidebarTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { toggle, isMobile } = useSidebar();
  
  if (isMobile) return null;

  return (
     <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={toggle}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col flex-1 overflow-y-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-col gap-1 px-2 py-4", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("relative", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

export const SidebarGroupLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { state, isMobile } = useSidebar()
  if (state === "collapsed" && !isMobile) return null;
  return (
    <p
      ref={ref}
      className={cn("px-2 py-2 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"


export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { isActive?: boolean, tooltip?: string }
>(({ className, isActive, tooltip, children, ...props }, ref) => {
    const { state, isMobile } = useSidebar()

    const buttonContent = (
      <div className={cn("flex items-center gap-3", state === 'collapsed' && !isMobile && "justify-center")}>
        {React.Children.map(children, (child, i) => {
            if (i === 0 && React.isValidElement(child)) {
                return React.cloneElement(child, { className: "h-4 w-4 shrink-0" });
            }
             if (i === 1 && (typeof child === 'string' || React.isValidElement(child))) {
                return <span className={cn("truncate", state === 'collapsed' && !isMobile && "sr-only")}>{child}</span>;
            }
            return child;
        })}
      </div>
    );
    
    if (state === 'collapsed' && !isMobile && tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        ref={ref}
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn("w-full justify-center", className)}
                        {...props}
                    >
                       {buttonContent}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        );
    }


    return (
        <Button
            ref={ref}
            variant={isActive ? "secondary" : "ghost"}
            className={cn("w-full justify-start", className)}
            {...props}
        >
            {buttonContent}
        </Button>
    )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto flex flex-col border-t", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"
