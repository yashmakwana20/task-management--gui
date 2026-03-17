//function Loader({ text = "Loading..." }) {
//    return (
//        <div className="flex flex-col items-center justify-center py-10">
//            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//            <p className="mt-4 text-gray-600 font-medium">{text}</p>
//        </div>
//    );
//}

function Loader({ text = "Loading..." }) {
    return (
        <div className="fixed inset-0 bg-black/20 flex flex-col items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-700 font-medium">{text}</p>
            </div>
        </div>
    );
}

export default Loader;