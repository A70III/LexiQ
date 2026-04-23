import SwiftUI

struct CoursesView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedSkill: Skill?
    @State private var showingAddCourse = false
    @State private var editingCourse: Course?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if dataStore.skills.isEmpty {
                    ContentUnavailableView(
                        "No Skills",
                        systemImage: "star",
                        description: Text("Add skills first to manage courses")
                    )
                } else {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(dataStore.skills) { skill in
                                SkillChip(
                                    skill: skill,
                                    isSelected: selectedSkill?.id == skill.id
                                )
                                .onTapGesture {
                                    if selectedSkill?.id == skill.id {
                                        selectedSkill = nil
                                    } else {
                                        selectedSkill = skill
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 12)
                    }
                    .background(Color(.systemGroupedBackground))

                    if let skill = selectedSkill {
                        let courses = dataStore.getCourses(for: skill.id)
                        if courses.isEmpty {
                            ContentUnavailableView(
                                "No Courses",
                                systemImage: "book",
                                description: Text("Add courses for \(skill.name)")
                            )
                        } else {
                            List {
                                ForEach(courses) { course in
                                    CourseRowView(course: course, skill: skill)
                                        .contentShape(Rectangle())
                                        .onTapGesture {
                                            editingCourse = course
                                        }
                                }
                                .onDelete { indexSet in
                                    let courses = dataStore.getCourses(for: skill.id)
                                    for index in indexSet {
                                        dataStore.deleteCourse(courses[index])
                                    }
                                }
                            }
                            .listStyle(.plain)
                        }
                    } else {
                        ContentUnavailableView(
                            "Select a Skill",
                            systemImage: "hand.tap",
                            description: Text("Tap a skill above to see its courses")
                        )
                    }
                }
            }
            .navigationTitle("Courses")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddCourse = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .disabled(selectedSkill == nil)
                }
            }
            .sheet(isPresented: $showingAddCourse) {
                if let skill = selectedSkill {
                    AddCourseView(skill: skill)
                }
            }
            .sheet(item: $editingCourse) { course in
                EditCourseView(course: course)
            }
        }
    }
}

struct SkillChip: View {
    let skill: Skill
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 6) {
            Text(skill.icon)
            Text(skill.name)
                .font(.subheadline.weight(.medium))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            isSelected
                ? Color(hex: skill.color)
                : Color(.systemGray5)
        )
        .foregroundStyle(isSelected ? .white : .primary)
        .clipShape(Capsule())
    }
}

struct CourseRowView: View {
    let course: Course
    let skill: Skill

    var progress: Double {
        guard course.totalLessons > 0 else { return 0 }
        return Double(course.completedLessons) / Double(course.totalLessons)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(course.title)
                    .font(.headline)

                Spacer()

                Text("\(course.completedLessons)/\(course.totalLessons)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            ProgressView(value: progress)
                .tint(Color(hex: skill.color))

            if let source = course.source, !source.isEmpty {
                Text(source)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

struct AddCourseView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let skill: Skill
    @State private var title = ""
    @State private var totalLessons = 10
    @State private var completedLessons = 0
    @State private var source = ""
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Course Info") {
                    TextField("Title", text: $title)
                        .textInputAutocapitalization(.words)
                }

                Section("Progress") {
                    Stepper("Total Lessons: \(totalLessons)", value: $totalLessons, in: 1...500)
                    Stepper("Completed: \(completedLessons)", value: $completedLessons, in: 0...totalLessons)
                }

                Section("Details (Optional)") {
                    TextField("Source (e.g., website, book)", text: $source)
                        .textInputAutocapitalization(.sentences)
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Add Course")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let formatter = ISO8601DateFormatter()
                        let course = Course(
                            id: UUID().uuidString,
                            title: title,
                            skillId: skill.id,
                            totalLessons: totalLessons,
                            completedLessons: completedLessons,
                            source: source.isEmpty ? nil : source,
                            notes: notes.isEmpty ? nil : notes,
                            createdAt: formatter.string(from: Date())
                        )
                        dataStore.addCourse(course)
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}

struct EditCourseView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let course: Course
    @State private var title: String
    @State private var totalLessons: Int
    @State private var completedLessons: Int
    @State private var source: String
    @State private var notes: String

    init(course: Course) {
        self.course = course
        _title = State(initialValue: course.title)
        _totalLessons = State(initialValue: course.totalLessons)
        _completedLessons = State(initialValue: course.completedLessons)
        _source = State(initialValue: course.source ?? "")
        _notes = State(initialValue: course.notes ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Course Info") {
                    TextField("Title", text: $title)
                        .textInputAutocapitalization(.words)
                }

                Section("Progress") {
                    Stepper("Total Lessons: \(totalLessons)", value: $totalLessons, in: 1...500)
                    Stepper("Completed: \(completedLessons)", value: $completedLessons, in: 0...totalLessons)
                }

                Section("Details (Optional)") {
                    TextField("Source", text: $source)
                        .textInputAutocapitalization(.sentences)
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button(role: .destructive) {
                        dataStore.deleteCourse(course)
                        dismiss()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Delete Course")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Edit Course")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let updated = Course(
                            id: course.id,
                            title: title,
                            skillId: course.skillId,
                            totalLessons: totalLessons,
                            completedLessons: completedLessons,
                            source: source.isEmpty ? nil : source,
                            notes: notes.isEmpty ? nil : notes,
                            createdAt: course.createdAt
                        )
                        dataStore.updateCourse(updated)
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}