import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{
        backgroundColor: "var(--md-sys-color-surface)",
        color: "var(--md-sys-color-on-surface)",
      }}
    >
      <div
        className="p-8 rounded-[32px] max-w-md flex flex-col items-center gap-4"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container-low)",
        }}
      >
        <span
          className="material-symbols-rounded filled text-[48px]"
          style={{ color: "var(--md-sys-color-primary)" }}
        >
          no_meals
        </span>
        <h1 className="m3-headline-large-emphasized text-3xl">
          Table Not Found
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          We couldn&apos;t find the page you were looking for. Head back to the
          roulette wheel to pick a great restaurant nearby!
        </p>
        <Link
          href="/"
          className="m3-expressive-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm m3-label-large-emphasized mt-2"
          style={{
            backgroundColor: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
          }}
        >
          <span className="material-symbols-rounded text-[18px]">casino</span>
          <span>Back to Foodlette</span>
        </Link>
      </div>
    </div>
  );
}
