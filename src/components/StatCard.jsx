function StatCard({
    title,
    value,
    subtitle,
    valueClassName = "text-gray-800",
    onClick,
    clickable = false,
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow p-6 transition ${clickable ? "cursor-pointer hover:shadow-md" : ""
                }`}
        >
            <p className="text-gray-500 text-sm">{title}</p>

            <h3 className={`text-2xl font-bold mt-2 ${valueClassName}`}>
                {value}
            </h3>

            {subtitle && (
                <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
            )}
        </div>
    );
}

export default StatCard;