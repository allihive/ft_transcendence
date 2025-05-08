import { NavBar } from '../../components/navbar'
import { useState, type JSX } from "react"
import BlueBox from './homePageBox'
import controller from './assets/controller.png'
import orangeCircle from './assets/orangeCircle.png'
import lines from './assets/3lines.png'


export function HomePage(): JSX.Element {
	const [activeItem, setActiveItem] = useState("home");
	return (
		<div className="flex min-h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar activeItem={activeItem} setActiveItem={setActiveItem}/>
			<div className="flex flex-col items-center justify-center">
				<BlueBox/>
			<div className="flex-1 p-6 flex flex-col items-center justify-center">
				<div className="flex items-center mt-8 justify-center">
				 	<h1 className="text-black dark:text-darkOrange font-title text-3xl h-full ">Transcendence</h1>
			 	</div>
			<div className="flex flex-row items-start space-x-30">
				<img src={controller} alt="up-down-arrows" className="w-32 h-auto" />
				<div className="flex flex-col items-center mt-8 justify-center border-2 border-black dark:border-background rounded-lg p-4">
					<h3 className="text-black dark:text-background font-title text-2xl h-full ">Made By</h3>
						<p className="text-black dark:text-background text-center font-body">Alice</p>
						<p className="text-black dark:text-background text-center font-body">Sumin</p>
						<p className="text-black dark:text-background text-center font-body">Hoang</p>
						<p className="text-black dark:text-background text-center font-body">Joseph</p>
						<p className="text-black dark:text-background text-center font-body">Timmo</p>
				</div>
					<div className="flex flex-col items-center">
					<img src={orangeCircle} alt="orangeCicle" className="w-32 h-auto" />
					<img src={lines} alt="3 lines" className="w-32 h-auto mt-10"/>
					</div>
			</div>	
		 </div>
		 </div>
		 </div>
	)
}