"use client";

import { useEffect } from "react";

import { ErrorNotice } from "@/components/error-notice";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage(props: ErrorPageProps) {
  useEffect(() => {
    console.error(props.error);
  }, [props.error]);

  return (
    <div className="stack">
      <ErrorNotice message={props.error.message || "Unexpected application error."} />
      <button className="button" type="button" onClick={props.reset}>
        Try again
      </button>
    </div>
  );
}

