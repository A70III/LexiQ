import SwiftUI

struct ScheduleView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var currentDate = Date()
    @State private var selectedDate: Date?
    @State private var showingAddPlan = false
    @State private var editingPlan: StudyPlan?

    private let calendar = Calendar.current
    private let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                CalendarHeaderView(
                    currentDate: $currentDate,
                    onPrevious: { changeMonth(by: -1) },
                    onNext: { changeMonth(by: 1) }
                )

                WeekdayHeaderView()

                CalendarGridView(
                    currentDate: currentDate,
                    selectedDate: $selectedDate,
                    studyPlans: dataStore.studyPlans,
                    skills: dataStore.skills,
                    dateFormatter: dateFormatter
                )
                .onTapGesture {
                    if let selected = selectedDate {
                        showingAddPlan = true
                    }
                }

                if let date = selectedDate {
                    let plans = dataStore.getStudyPlans(for: dateFormatter.string(from: date))
                    if !plans.isEmpty {
                        Divider()
                        List {
                            ForEach(plans) { plan in
                                StudyPlanRowView(plan: plan)
                                    .contentShape(Rectangle())
                                    .onTapGesture {
                                        editingPlan = plan
                                    }
                            }
                            .onDelete { indexSet in
                                let plans = dataStore.getStudyPlans(for: dateFormatter.string(from: date))
                                for index in indexSet {
                                    dataStore.deleteStudyPlan(plans[index])
                                }
                            }
                        }
                        .listStyle(.plain)
                        .frame(maxHeight: 200)
                    }
                }

                Spacer()
            }
            .navigationTitle("Schedule")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        selectedDate = Date()
                        showingAddPlan = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddPlan) {
                if let date = selectedDate {
                    AddStudyPlanView(date: dateFormatter.string(from: date))
                }
            }
            .sheet(item: $editingPlan) { plan in
                EditStudyPlanView(plan: plan)
            }
        }
    }

    private func changeMonth(by value: Int) {
        if let newDate = calendar.date(byAdding: .month, value: value, to: currentDate) {
            currentDate = newDate
        }
    }
}

struct CalendarHeaderView: View {
    @Binding var currentDate: Date
    let onPrevious: () -> Void
    let onNext: () -> Void

    private let formatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "MMMM yyyy"
        return f
    }()

    var body: some View {
        HStack {
            Button(action: onPrevious) {
                Image(systemName: "chevron.left")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(formatter.string(from: currentDate))
                .font(.headline)

            Spacer()

            Button(action: onNext) {
                Image(systemName: "chevron.right")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}

struct WeekdayHeaderView: View {
    let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(weekdays, id: \.self) { day in
                Text(day)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal)
        .padding(.bottom, 8)
    }
}

struct CalendarGridView: View {
    let currentDate: Date
    @Binding var selectedDate: Date?
    let studyPlans: [StudyPlan]
    let skills: [Skill]
    let dateFormatter: DateFormatter

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 7)
    private let calendar = Calendar.current

    var daysInMonth: [Date?] {
        guard let monthStart = calendar.date(from: calendar.dateComponents([.year, .month], from: currentDate)),
              let monthRange = calendar.range(of: .day, in: .month, for: currentDate) else {
            return []
        }

        let firstWeekday = calendar.component(.weekday, from: monthStart) - 1
        var days: [Date?] = Array(repeating: nil, count: firstWeekday)

        for day in monthRange {
            if let date = calendar.date(byAdding: .day, value: day - 1, to: monthStart) {
                days.append(date)
            }
        }

        while days.count % 7 != 0 {
            days.append(nil)
        }

        return days
    }

    var body: some View {
        LazyVGrid(columns: columns, spacing: 4) {
            ForEach(Array(daysInMonth.enumerated()), id: \.offset) { _, date in
                if let date = date {
                    let dateString = dateFormatter.string(from: date)
                    let plans = studyPlans.filter { $0.date == dateString }
                    let isToday = calendar.isDateInToday(date)
                    let isSelected = selectedDate.map { calendar.isDate($0, inSameDayAs: date) } ?? false

                    CalendarDayView(
                        date: date,
                        isToday: isToday,
                        isSelected: isSelected,
                        plans: plans,
                        skills: skills
                    )
                    .onTapGesture {
                        if isSelected {
                            selectedDate = nil
                        } else {
                            selectedDate = date
                        }
                    }
                } else {
                    Color.clear
                        .frame(height: 44)
                }
            }
        }
        .padding(.horizontal)
    }
}

struct CalendarDayView: View {
    let date: Date
    let isToday: Bool
    let isSelected: Bool
    let plans: [StudyPlan]
    let skills: [Skill]

    private let calendar = Calendar.current

    var body: some View {
        VStack(spacing: 2) {
            Text("\(calendar.component(.day, from: date))")
                .font(.subheadline)
                .fontWeight(isToday ? .bold : .regular)
                .foregroundStyle(isToday ? .white : .primary)
                .frame(width: 28, height: 28)
                .background(
                    Circle()
                        .fill(isToday ? Color.blue : (isSelected ? Color.blue.opacity(0.2) : Color.clear))
                )

            if !plans.isEmpty {
                HStack(spacing: 2) {
                    ForEach(Array(plans.prefix(3))) { plan in
                        let skill = skills.first { $0.id == plan.skillId }
                        Circle()
                            .fill(Color(hex: skill?.color ?? "#007AFF"))
                            .frame(width: 4, height: 4)
                    }
                }
            }
        }
        .frame(height: 44)
    }
}

struct StudyPlanRowView: View {
    let plan: StudyPlan
    @EnvironmentObject var dataStore: DataStore

    var skill: Skill? {
        dataStore.getSkill(by: plan.skillId)
    }

    var body: some View {
        HStack {
            Circle()
                .fill(Color(hex: skill?.color ?? "#007AFF"))
                .frame(width: 8, height: 8)

            Text(plan.title)
                .font(.subheadline)

            Spacer()

            if plan.completed {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
            } else {
                Image(systemName: "circle")
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct AddStudyPlanView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let date: String
    @State private var title = ""
    @State private var selectedSkill: Skill?
    @State private var selectedCourse: Course?
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Plan Details") {
                    TextField("Title", text: $title)
                        .textInputAutocapitalization(.sentences)
                }

                Section("Skill") {
                    Picker("Skill", selection: $selectedSkill) {
                        Text("Select Skill").tag(nil as Skill?)
                        ForEach(dataStore.skills) { skill in
                            HStack {
                                Text(skill.icon)
                                Text(skill.name)
                            }
                            .tag(skill as Skill?)
                        }
                    }
                    .onChange(of: selectedSkill) { _, newValue in
                        selectedCourse = nil
                    }

                    if let skill = selectedSkill {
                        let courses = dataStore.getCourses(for: skill.id)
                        if !courses.isEmpty {
                            Picker("Course (Optional)", selection: $selectedCourse) {
                                Text("None").tag(nil as Course?)
                                ForEach(courses) { course in
                                    Text(course.title).tag(course as Course?)
                                }
                            }
                        }
                    }
                }

                Section("Notes (Optional)") {
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Add Study Plan")
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
                        let plan = StudyPlan(
                            id: UUID().uuidString,
                            title: title,
                            skillId: selectedSkill?.id ?? "",
                            courseId: selectedCourse?.id,
                            date: date,
                            completed: false,
                            notes: notes.isEmpty ? nil : notes,
                            createdAt: formatter.string(from: Date())
                        )
                        dataStore.addStudyPlan(plan)
                        dismiss()
                    }
                    .disabled(title.isEmpty || selectedSkill == nil)
                }
            }
        }
    }
}

struct EditStudyPlanView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let plan: StudyPlan
    @State private var title: String
    @State private var completed: Bool
    @State private var notes: String

    init(plan: StudyPlan) {
        self.plan = plan
        _title = State(initialValue: plan.title)
        _completed = State(initialValue: plan.completed)
        _notes = State(initialValue: plan.notes ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Plan Details") {
                    TextField("Title", text: $title)
                        .textInputAutocapitalization(.sentences)

                    Toggle("Completed", isOn: $completed)
                }

                Section("Notes (Optional)") {
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button(role: .destructive) {
                        dataStore.deleteStudyPlan(plan)
                        dismiss()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Delete Plan")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Edit Plan")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let updated = StudyPlan(
                            id: plan.id,
                            title: title,
                            skillId: plan.skillId,
                            courseId: plan.courseId,
                            date: plan.date,
                            completed: completed,
                            notes: notes.isEmpty ? nil : notes,
                            createdAt: plan.createdAt
                        )
                        dataStore.updateStudyPlan(updated)
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}