"use client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";

export function HeaderNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger>Hotels & Resorts</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/">Coming Soon!</Link>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/">Special Offers</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/">Partners</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/">About Zen Hotels</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
