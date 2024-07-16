"use client";
import { useState, useRef } from "react";
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { CircularProgress } from "@nextui-org/progress";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";

import { api } from "@/convex/_generated/api";
import { title } from "@/components/primitives";
import { PageProps } from "@/types";

const UrlModal = ({
  url,
  buttonRef,
}: {
  url: string;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button ref={buttonRef} className="hidden" onPress={onOpen} />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Message Sent
              </ModalHeader>
              <ModalBody>
                <a
                  className="text-blue text-underline"
                  href={url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {url}
                </a>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  <a href={url} rel="noreferrer" target="_blank">
                    See graph
                  </a>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

const ThreadFunction = ({ params: { threadId } }: PageProps) => {
  const [isWithMessage, setIsWithMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const useFunctionWithMessage = useAction(api.openai.useFunctionWithMessage);
  const useFunctionWithOutMessage = useAction(
    api.openai.useFunctionWithOutMessage,
  );
  const [message, setMessage] = useState("");

  const useWithMessage = async () => {
    setIsLoading(true);
    try {
      const response = await useFunctionWithMessage({ threadId, message });

      setUrl(response!.url);
      buttonRef.current?.click();
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const useWithOutMessage = async () => {
    setIsLoading(true);
    try {
      const response = await useFunctionWithOutMessage({ threadId });

      setUrl(response!.url);
      buttonRef.current?.click();
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mt-[100px]">
      <UrlModal buttonRef={buttonRef} url={url} />
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
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            className="w-full"
            size="lg"
            variant="ghost"
            onClick={useWithMessage}
          >
            Use Function with Message
            {isLoading && <CircularProgress size="sm" />}
          </Button>
        </section>
      ) : (
        <section className="flex flex-col mt-10 w-[650px]">
          <h2 className={title()}>Use Function on queued message</h2>
          <Button
            className="mt-4 w-full"
            size="lg"
            variant="ghost"
            onClick={useWithOutMessage}
          >
            Use Function Without Message
            {isLoading && <CircularProgress size="sm" />}
          </Button>
        </section>
      )}
    </section>
  );
};

export default ThreadFunction;
