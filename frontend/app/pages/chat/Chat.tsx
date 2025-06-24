import { useState, useEffect, type JSX } from "react"
import { FiSend } from "react-icons/fi";

export function ChatPage(): JSX.Element {
	// const [messages, setMessages] = useState([]);
	// useEffect(() => {
	// 	fetch("/api/messages")
	// 	.then((res) => res.json())
	// 	.then((data) => setMessages(data));
	// }, []);

	// const sender = msg.name;
	// const receiver = msg.members;
	// const groupName = msg.room.name;
	// need a go get messages and 

	return (
		<>
			<div className="py-12 px-4">
				<div className="flex flex-row w-full gap-2 h-screen">
					<div className="w-1/4 bg-lightOrange border rounded-lg px-4 py-4">
						<p className="text-center font-title text-lg">Chats</p>
						<div className="flex flex-col py-4 gap-y-4">
							<div className="border border-darkBlue bg-darkBlue rounded-md font-body py-2 px-2">
								<p className="text-background">Sumin</p>
								<p className="text-xs text-gray-400">writing some messages here blah blah</p>
							</div>
							<div className="border border-darkBlue bg-darkMode rounded-md font-body py-2 px-2">
								{/* <p>{sender}</p> */}
								<p>Name</p>
								<p className="text-xs text-gray-900">writing some messages here blah blah</p>
							</div>
							<div className="border border-darkBlue bg-darkMode rounded-md font-body py-2 px-2">
								{/* <p>{receiver}</p> */}
								<p>Name</p>
								<p className="text-xs text-gray-900">writing some messages here blah blah</p>
							</div>
						</div>
					</div>
					<div className="w-3/4 flex flex-col font-title text-lg border bg-lightOrange dark:bg-darkMode border-background rounded-lg px-4 py-4">
						<p className="mb-2 text-center">Sumin</p>

						{/* Message List */}
						<div className="flex-1 overflow-y-auto flex flex-col space-y-2 p-4">
							<div className="bg-white p-2 rounded-md w-fit">Incoming message</div>
							<div className="bg-blue-500 text-white p-2 rounded-md w-fit self-end">Outgoing message</div>
						</div>

						{/* Input Area pinned at bottom */}
						<div className="pt-2 border-t dark:border-background mt-2 flex flex-row justify-between gap-x-6">
							<input
								type="text"
								placeholder="Message here"
								className="font-body border dark:border-background w-full rounded-xl p-2"
							/>
							<button className="border rounded-full p-4 bg-background">
								<FiSend />
							</button>
						</div>
					</div>
				</div>
			</div >
		</>
	)
}