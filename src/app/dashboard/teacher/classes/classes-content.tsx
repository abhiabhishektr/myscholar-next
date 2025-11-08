"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, BookOpen, User, Filter, Download } from "lucide-react";
import { toast } from "react-hot-toast";

interface ClassRecord {
	id: string;
	studentId: string;
	studentName: string;
	subjectId: string;
	subjectName: string;
	classDate: string;
	startTime: string;
	duration: string;
	notes: string | null;
	markedAt: string;
}

export default function MyClassesContent() {
	const [classes, setClasses] = useState<ClassRecord[]>([]);
	const [filteredClasses, setFilteredClasses] = useState<ClassRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [studentNameFilter, setStudentNameFilter] = useState("");

	useEffect(() => {
		fetchClasses();
	}, []);

	useEffect(() => {
		filterClasses();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [classes, startDate, endDate, studentNameFilter]);

	const fetchClasses = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/teacher/attendance");
			if (!response.ok) throw new Error("Failed to fetch classes");
			const data = await response.json();
			setClasses(data.attendance || []);
		} catch (error) {
			console.error("Error fetching classes:", error);
			toast.error("Failed to load classes");
		} finally {
			setLoading(false);
		}
	};

	const filterClasses = () => {
		let filtered = [...classes];

		if (startDate) {
			filtered = filtered.filter((cls) => cls.classDate >= startDate);
		}

		if (endDate) {
			filtered = filtered.filter((cls) => cls.classDate <= endDate);
		}

		if (studentNameFilter) {
			filtered = filtered.filter((cls) =>
				cls.studentName
					.toLowerCase()
					.includes(studentNameFilter.toLowerCase())
			);
		}

		setFilteredClasses(filtered);
	};

	const exportToCSV = () => {
		if (filteredClasses.length === 0) {
			toast.error("No data to export");
			return;
		}

		const headers = [
			"Date",
			"Student",
			"Subject",
			"Start Time",
			"Duration",
			"Notes",
			"Marked At",
		];

		const csvData = filteredClasses.map((cls) => [
			cls.classDate,
			cls.studentName,
			cls.subjectName,
			cls.startTime,
			cls.duration,
			cls.notes || "",
			new Date(cls.markedAt).toLocaleString(),
		]);

		const csvContent = [
			headers.join(","),
			...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `classes-${new Date()
			.toISOString()
			.split("T")[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);

		toast.success("Exported to CSV");
	};

	const calculateStats = () => {
		const totalClasses = filteredClasses.length;
		const totalHours = filteredClasses.reduce((acc, cls) => {
			const hours = {
				"30min": 0.5,
				"1hr": 1,
				"1.5hr": 1.5,
				"2hr": 2,
			}[cls.duration] || 0;
			return acc + hours;
		}, 0);
		const uniqueStudents = new Set(
			filteredClasses.map((cls) => cls.studentId)
		).size;

		return { totalClasses, totalHours, uniqueStudents };
	};

	const stats = calculateStats();

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
						<p className="mt-4 text-gray-600 dark:text-gray-400">
							Loading classes...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-auto">
			<div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold">My Classes</h1>
					<p className="text-gray-500 dark:text-gray-400">
						View your class attendance history
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Classes
							</CardTitle>
							<BookOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.totalClasses}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Hours
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.totalHours.toFixed(1)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Students Taught
							</CardTitle>
							<User className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.uniqueStudents}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Filters
						</CardTitle>
						<CardDescription>
							Filter classes by date range and student
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="startDate">Start Date</Label>
								<Input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">End Date</Label>
								<Input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="studentName">Student Name</Label>
								<Input
									id="studentName"
									type="text"
									placeholder="Search by name..."
									value={studentNameFilter}
									onChange={(e) => setStudentNameFilter(e.target.value)}
								/>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<Button
								variant="outline"
								onClick={() => {
									setStartDate("");
									setEndDate("");
									setStudentNameFilter("");
								}}
							>
								Clear Filters
							</Button>
							<Button variant="outline" onClick={exportToCSV}>
								<Download className="h-4 w-4 mr-2" />
								Export CSV
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Classes List */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">
						Class History (
						{filteredClasses.length}{" "}
						{filteredClasses.length === 1 ? "class" : "classes"})
					</h2>

					{filteredClasses.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<BookOpen className="h-12 w-12 text-gray-400 mb-4" />
								<p className="text-gray-500 dark:text-gray-400 text-center">
									No classes found matching your filters
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{filteredClasses.map((cls) => (
								<Card key={cls.id}>
									<CardContent className="pt-6">
										<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
											<div className="space-y-2 flex-1">
												<div className="flex items-center gap-2">
													<Badge variant="outline">
														<Calendar className="h-3 w-3 mr-1" />
														{new Date(cls.classDate).toLocaleDateString()}
													</Badge>
													<Badge variant="outline">
														<Clock className="h-3 w-3 mr-1" />
														{cls.startTime}
													</Badge>
													<Badge>{cls.duration}</Badge>
												</div>

												<div>
													<h3 className="font-semibold text-lg">
														{cls.subjectName}
													</h3>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														Student: {cls.studentName}
													</p>
												</div>

												{cls.notes && (
													<p className="text-sm text-gray-500 dark:text-gray-400">
														Notes: {cls.notes}
													</p>
												)}

												<p className="text-xs text-gray-400">
													Marked:{" "}
													{new Date(cls.markedAt).toLocaleString()}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
