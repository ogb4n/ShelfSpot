// Card minimal compatible shadcn/ui
type CardProps = React.HTMLAttributes<HTMLDivElement>;
export function Card({ className, ...props }: CardProps) {
    return (
        <div className={"rounded-xl border bg-white dark:bg-black shadow p-6 " + (className || "")} {...props} />
    );
}