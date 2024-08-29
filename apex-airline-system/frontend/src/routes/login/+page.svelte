<script lang="ts">
  import { enhance } from "$app/forms";

  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Loader2 } from "lucide-svelte";

  export let form;

  let loading = false;
</script>

<div
  class="min-h-[calc(100vh-5rem)] bg-[url('$lib/assets/home-background.jpg')] bg-cover bg-fixed"
>
  <div class="container flex h-full p-8 justify-center items-center">
    <form
      method="POST"
      use:enhance={() => {
        loading = true;

        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
      class="flex flex-col gap-y-5 bg-background p-8 rounded-lg w-[34.125rem]"
    >
      <div class="flex flex-col">
        <div class="flex items-center">
          <div class="font-bold text-xl">Log In - UAT</div>
          <Loader2
            class="shrink-0 ml-3 h-4 w-4 animate-spin {!loading && 'hidden'}"
          />
        </div>
        <Button variant="link" class="p-0 self-baseline" href="/signin">
          Don't have an account? Sign In
        </Button>
        {#if form?.error}
          <div class="text-sm text-red-500 font-medium">
            Error: {form.error}
          </div>
        {/if}
      </div>
      <div class="flex flex-col gap-y-2">
        <Label for="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div class="flex flex-col gap-y-2">
        <Label for="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button disabled={loading} type="submit">Log In</Button>
    </form>
  </div>
</div>
