"use client";
import { useState } from "react";
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import { title } from "@/components/primitives";
import { PageProps } from "@/types";

const ThreadFunction = ({ params: { threadId } }: PageProps) => {
  const [isWithMessage, setIsWithMessage] = useState(true);
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mt-[100px]">
      <section className="flex justify-between gap-6 w-[600px]">
        <h1 className="text-[20px] font-bold text-left my-auto">
          Using Thread:&nbsp;
          <em className="text-white-2 font-medium">{threadId}</em>
        </h1>
        <Button
          className="w-2/5"
          size="lg"
          variant="ghost"
          onClick={() => router.push("/")}
        >
          &larr; Clear Thread Id
        </Button>
      </section>

      <div className="button_select mb-10 w-[600px]">
        <Button
          className={`${!isWithMessage && "bg-black-6"}`}
          type="button"
          variant="solid"
          onClick={() => setIsWithMessage(true)}
        >
          Create With Message
        </Button>
        <Button
          className={`${isWithMessage && "bg-black-6"}`}
          type="button"
          variant="solid"
          onClick={() => setIsWithMessage(false)}
        >
          Create Without Message
        </Button>
      </div>

      {isWithMessage ? (
        <section className="flex flex-col gap-6 w-[600px]">
          <h2 className={title()}>Use Function with Message</h2>
          <Textarea
            aria-label="Message"
            className="w-full"
            label="Message"
            placeholder="Type your message here..."
            style={{ fontSize: "18px" }}
            type="text"
          />
          <Button className="w-full" size="lg" variant="ghost">
            Use Function with Message
          </Button>
        </section>
      ) : (
        <section className="flex flex-col mt-10 w-[650px]">
          <h2 className={title()}>Use Function on queued message</h2>
          <Button className="mt-4 w-full" size="lg" variant="ghost">
            Use Function Without Message
          </Button>
        </section>
      )}
    </section>
  );
};

export default ThreadFunction;
