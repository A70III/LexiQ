import SwiftUI

struct SkillsView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var showingAddSkill = false
    @State private var editingSkill: Skill?

    var body: some View {
        NavigationStack {
            List {
                ForEach(dataStore.skills) { skill in
                    SkillRowView(skill: skill)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            editingSkill = skill
                        }
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        dataStore.deleteSkill(dataStore.skills[index])
                    }
                }
            }
            .navigationTitle("Skills")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddSkill = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddSkill) {
                AddSkillView()
            }
            .sheet(item: $editingSkill) { skill in
                EditSkillView(skill: skill)
            }
        }
    }
}

struct SkillRowView: View {
    let skill: Skill
    @EnvironmentObject var dataStore: DataStore

    var latestScore: ScoreRecord? {
        dataStore.getLatestScore(for: skill.id)
    }

    var progress: Double {
        guard let score = latestScore else { return 0 }
        return min(score.band / skill.targetBand, 1.0)
    }

    var body: some View {
        HStack(spacing: 12) {
            Text(skill.icon)
                .font(.title)
                .frame(width: 44, height: 44)
                .background(Color(hex: skill.color).opacity(0.2))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(skill.name)
                    .font(.headline)

                if let score = latestScore {
                    Text("Latest: \(String(format: "%.1f", score.band))")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } else {
                    Text("No scores yet")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("Target")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(String(format: "%.1f", skill.targetBand))
                    .font(.headline)
                    .foregroundStyle(Color(hex: skill.color))
            }
        }
        .padding(.vertical, 8)
    }
}

struct AddSkillView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var icon = "📚"
    @State private var targetBand = 7.0
    @State private var color = "#007AFF"

    let icons = ["📚", "🎯", "📝", "🗣️", "🎧", "📖", "✍️", "🎤", "💡", "🚀", "⭐", "🔥"]

    let colors = ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5856D6", "#AF52DE", "#00C7BE", "#FF3B30"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Skill Info") {
                    TextField("Name", text: $name)
                        .textInputAutocapitalization(.words)

                    Picker("Icon", selection: $icon) {
                        ForEach(icons, id: \.self) { icon in
                            Text(icon).tag(icon)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(height: 80)
                }

                Section("Target") {
                    HStack {
                        Text("Target Band")
                        Spacer()
                        Text(String(format: "%.1f", targetBand))
                            .foregroundStyle(.secondary)
                    }
                    Slider(value: $targetBand, in: 4...9, step: 0.5)
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                        ForEach(colors, id: \.self) { c in
                            Circle()
                                .fill(Color(hex: c))
                                .frame(width: 40, height: 40)
                                .overlay {
                                    if color == c {
                                        Image(systemName: "checkmark")
                                            .foregroundStyle(.white)
                                            .font(.caption.bold())
                                    }
                                }
                                .onTapGesture {
                                    color = c
                                }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .navigationTitle("Add Skill")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let skill = Skill(
                            id: UUID().uuidString,
                            name: name,
                            icon: icon,
                            targetBand: targetBand,
                            color: color
                        )
                        dataStore.addSkill(skill)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

struct EditSkillView: View {
    @EnvironmentObject var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss

    let skill: Skill
    @State private var name: String
    @State private var icon: String
    @State private var targetBand: Double
    @State private var color: String

    let icons = ["📚", "🎯", "📝", "🗣️", "🎧", "📖", "✍️", "🎤", "💡", "🚀", "⭐", "🔥"]
    let colors = ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5856D6", "#AF52DE", "#00C7BE", "#FF3B30"]

    init(skill: Skill) {
        self.skill = skill
        _name = State(initialValue: skill.name)
        _icon = State(initialValue: skill.icon)
        _targetBand = State(initialValue: skill.targetBand)
        _color = State(initialValue: skill.color)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Skill Info") {
                    TextField("Name", text: $name)
                        .textInputAutocapitalization(.words)

                    Picker("Icon", selection: $icon) {
                        ForEach(icons, id: \.self) { icon in
                            Text(icon).tag(icon)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(height: 80)
                }

                Section("Target") {
                    HStack {
                        Text("Target Band")
                        Spacer()
                        Text(String(format: "%.1f", targetBand))
                            .foregroundStyle(.secondary)
                    }
                    Slider(value: $targetBand, in: 4...9, step: 0.5)
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                        ForEach(colors, id: \.self) { c in
                            Circle()
                                .fill(Color(hex: c))
                                .frame(width: 40, height: 40)
                                .overlay {
                                    if color == c {
                                        Image(systemName: "checkmark")
                                            .foregroundStyle(.white)
                                            .font(.caption.bold())
                                    }
                                }
                                .onTapGesture {
                                    color = c
                                }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    Button(role: .destructive) {
                        dataStore.deleteSkill(skill)
                        dismiss()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Delete Skill")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Edit Skill")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let updated = Skill(
                            id: skill.id,
                            name: name,
                            icon: icon,
                            targetBand: targetBand,
                            color: color
                        )
                        dataStore.updateSkill(updated)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}