import SwiftUI

struct ScoresView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedSkill: Skill?
    @State private var showingAddScore = false
    @State private var editingScore: ScoreRecord?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if dataStore.skills.isEmpty {
                    ContentUnavailableView(
                        "No Skills",
                        systemImage: "star",
                        description: Text("Add skills first to record scores")
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
                        let scores = dataStore.getScores(for: skill.id)
                            .sorted { $0.date > $1.date }

                        if scores.isEmpty {
                            ContentUnavailableView(
                                "No Scores",
                                systemImage: "chart.bar",
                                description: Text("Add scores for \(skill.name)")
                            )
                        } else {
                            List {
                                ForEach(scores) { score in
                                    ScoreRowView(score: score, skill: skill)
                                        .contentShape(Rectangle())
                                        .onTapGesture {
                                            editingScore = score
                                        }
                                }
                                .onDelete { indexSet in
                                    let scores = dataStore.getScores(for: skill.id)
                                        .sorted { $0.date > $1.date }
                                    for index in indexSet {
                                        dataStore.deleteScore(scores[index])
                                    }
                                }
                            }
                            .listStyle(.plain)
                        }
                    } else {
                        ContentUnavailableView(
                            "Select a Skill",
                            systemImage: "hand.tap",
                            description: Text("Tap a skill above to see its scores")
                        )
                    }
                }
            }
            .navigationTitle("Scores")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddScore = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .disabled(selectedSkill == nil)
                }
            }
            .sheet(isPresented: $showingAddScore) {
                if let skill = selectedSkill {
                    AddScoreView(skill: skill)
                }
            }
            .sheet(item: $editingScore) { score in
                EditScoreView(score: score)
            }
        }
    }
}

struct ScoreRowView: View {
    let score: ScoreRecord
    let skill: Skill

    var bandColor: Color {
        if score.band >= skill.targetBand {
            return .green
        } else if score.band >= skill.targetBand - 1 {
            return .orange
        } else {
            return .red
        }
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(score.date)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if let testName = score.testName, !testName.isEmpty {
                    Text(testName)
                        .font(.headline)
                } else {
                    Text("Score")
                        .font(.headline)
                }

                if let notes = score.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1f", score.band))
                    .font(.title2.bold())
                    .foregroundStyle(bandColor)

                if score.band >= skill.targetBand {
                    Text("Target")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    Text(String(format: "%.1f needed", skill.targetBand - score.band))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

struct AddScoreView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let skill: Skill
    @State private var band = 5.0
    @State private var date = Date()
    @State private var testName = ""
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Score") {
                    VStack(spacing: 8) {
                        Text(String(format: "%.1f", band))
                            .font(.largeTitle.bold())
                            .foregroundStyle(Color(hex: skill.color))

                        Slider(value: $band, in: 1...9, step: 0.5)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }

                Section("Date") {
                    DatePicker(
                        "Test Date",
                        selection: $date,
                        displayedComponents: .date
                    )
                }

                Section("Details (Optional)") {
                    TextField("Test Name (e.g., IELTS, Mock Test)", text: $testName)
                        .textInputAutocapitalization(.words)
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Add Score")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let formatter = DateFormatter()
                        formatter.dateFormat = "yyyy-MM-dd"
                        let score = ScoreRecord(
                            id: UUID().uuidString,
                            skillId: skill.id,
                            band: band,
                            date: formatter.string(from: date),
                            testName: testName.isEmpty ? nil : testName,
                            notes: notes.isEmpty ? nil : notes
                        )
                        dataStore.addScore(score)
                        dismiss()
                    }
                }
            }
        }
    }
}

struct EditScoreView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let score: ScoreRecord
    @State private var band: Double
    @State private var date: Date
    @State private var testName: String
    @State private var notes: String

    var skill: Skill? {
        dataStore.getSkill(by: score.skillId)
    }

    init(score: ScoreRecord) {
        self.score = score
        _band = State(initialValue: score.band)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        _date = State(initialValue: formatter.date(from: score.date) ?? Date())
        _testName = State(initialValue: score.testName ?? "")
        _notes = State(initialValue: score.notes ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                if let skill = skill {
                    Section("Score") {
                        VStack(spacing: 8) {
                            Text(String(format: "%.1f", band))
                                .font(.largeTitle.bold())
                                .foregroundStyle(Color(hex: skill.color))

                            Slider(value: $band, in: 1...9, step: 0.5)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    }
                }

                Section("Date") {
                    DatePicker(
                        "Test Date",
                        selection: $date,
                        displayedComponents: .date
                    )
                }

                Section("Details (Optional)") {
                    TextField("Test Name", text: $testName)
                        .textInputAutocapitalization(.words)
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button(role: .destructive) {
                        dataStore.deleteScore(score)
                        dismiss()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Delete Score")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Edit Score")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let formatter = DateFormatter()
                        formatter.dateFormat = "yyyy-MM-dd"
                        let updated = ScoreRecord(
                            id: score.id,
                            skillId: score.skillId,
                            band: band,
                            date: formatter.string(from: date),
                            testName: testName.isEmpty ? nil : testName,
                            notes: notes.isEmpty ? nil : notes
                        )
                        dataStore.addScore(updated)
                        dismiss()
                    }
                }
            }
        }
    }
}