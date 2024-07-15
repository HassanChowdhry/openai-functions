"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import { title } from "@/components/primitives";

export default function Home() {
  const [threadId, setThreadId] = useState("");
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 mt-32 md:py-10">
      <div>
        <section className="flex flex-col gap-6 w-[600px]">
          <h2 className={title()}>Enter the thread Id</h2>
          <Input
            aria-label="thread id"
            className="w-full"
            label="Thread Id"
            placeholder="Type your thread id here..."
            style={{ fontSize: "18px" }}
            type="text"
            onChange={(e) => setThreadId(e.target.value)}
          />
          <Button
            className="w-full"
            size="lg"
            variant="ghost"
            onClick={() => router.push(`/threads/${threadId}`)}
          >
            Set Thread
          </Button>
        </section>
      </div>
    </section>
  );
}
