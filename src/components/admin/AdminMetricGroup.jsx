import AdminMetricCard from "./AdminMetricCard";

const AdminMetricGroup = ({ title, description, cards, children }) => (
    <section>
        <div className="mb-3">
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(card => <AdminMetricCard key={card.label} {...card} />)}
            {children}
        </div>
    </section>
);

export default AdminMetricGroup;
