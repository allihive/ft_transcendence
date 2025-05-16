import { useState, type JSX } from "react"
import BlueBox from './HomeLogin'
import controller from './assets/controller.png'
import orangeCircle from './assets/orangeCircle.png'
import lines from './assets/3lines.png'
import { NavLink } from "react-router"

export function HomePage(): JSX.Element {
	return (
		<div className="flex flex-col justify-center items-center w-full pb-16 pt-8">
			<div className="w-[600px] h-[450px] relative bg-pop border-4 border-black rounded-md shadow-md justify-center items-center pb-16 space-y-4">
				<div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
					<NavLink to="/play" className="text-black text-center pt-4 pb-4 px-6 text-2xl font-title border-2 border-black rounded-lg">Play</NavLink>
					<NavLink to="/login" className="text-black text-center pt-4 pb-4 px-6 text-2xl font-title border-2 border-black rounded-lg">Login</NavLink>
				</div>
			</div>
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
						<img src={lines} alt="3 lines" className="w-32 h-auto mt-10" />
					</div>
				</div>
				</div>
			</div>
	)
}