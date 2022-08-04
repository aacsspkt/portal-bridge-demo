import { ReactNode } from 'react';

import {
  Id,
  toast,
  ToastOptions,
  ToastPromiseParams,
} from 'react-toastify';

export default function useToast() {
	const defaultOptions: ToastOptions = {
		position: toast.POSITION.BOTTOM_RIGHT,
		autoClose: 3000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		className: "bg-gray-400 text-md",
		bodyClassName: "bg-white text-xl",
	};

	const toastSuccess = (content: ReactNode) => {
		console.log("toast success");
		return toast.success(content);
	};

	const toastWarning = (content: ReactNode) => {
		return toast.warn(content, defaultOptions);
	};

	const toastError = (content: ReactNode) => {
		return toast.error(content, defaultOptions);
	};

	const toastInfo = (content: ReactNode) => {
		return toast.error(content, defaultOptions);
	};

	const toastPromise = (promise: Promise<unknown>, { pending, success, error }: ToastPromiseParams<unknown>) => {
		return toast.promise(
			promise,
			{
				pending,
				success,
				error,
			},
			defaultOptions,
		);
	};

	const toastLoading = (content: ReactNode) => {
		return toast.loading(content, defaultOptions);
	};

	const updateToast = (id: Id) => {
		toast.update(id, defaultOptions);
	};

	return {
		toastSuccess,
		toastWarning,
		toastError,
		toastInfo,
		toastPromise,
		toastLoading,
		updateToast,
	};
}
