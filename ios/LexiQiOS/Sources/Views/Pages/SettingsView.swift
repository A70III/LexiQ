import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var showingSyncInfo = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Label {
                            Text("Server Address")
                        } icon: {
                            Image(systemName: "desktopcomputer")
                                .foregroundStyle(.blue)
                        }

                        Spacer()

                        TextField("http://192.168.x.x:7878", text: $dataStore.serverAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.URL)
                            .frame(maxWidth: 180)
                            .multilineTextAlignment(.trailing)
                    }

                    HStack {
                        Button {
                            Task {
                                await dataStore.syncFromMac()
                            }
                        } label: {
                            HStack {
                                Image(systemName: "arrow.down.circle")
                                Text("Sync From Mac")
                            }
                        }
                        .disabled(dataStore.serverAddress.isEmpty || dataStore.isSyncing)

                        Spacer()

                        Button {
                            Task {
                                await dataStore.syncToMac()
                            }
                        } label: {
                            HStack {
                                Image(systemName: "arrow.up.circle")
                                Text("Push To Mac")
                            }
                        }
                        .disabled(dataStore.serverAddress.isEmpty || dataStore.isSyncing)
                    }
                    .buttonStyle(.bordered)

                    if dataStore.isSyncing {
                        HStack {
                            Spacer()
                            ProgressView()
                            Text("Syncing...")
                                .foregroundStyle(.secondary)
                            Spacer()
                        }
                    }

                    if let lastSync = dataStore.lastSyncDate {
                        HStack {
                            Image(systemName: "clock")
                                .foregroundStyle(.secondary)
                            Text("Last sync: \(lastSync.formatted())")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                } header: {
                    Text("Sync with Mac")
                } footer: {
                    Text("Make sure LexiQ app is running on your Mac and both devices are on the same network.")
                }

                if let error = dataStore.errorMessage {
                    Section {
                        HStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundStyle(.orange)
                            Text(error)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Target Bands") {
                    ForEach(dataStore.skills) { skill in
                        TargetBandRow(skill: skill)
                    }
                }

                Section("Data") {
                    Button {
                        dataStore.skills = AppData.empty.skills
                        dataStore.courses = []
                        dataStore.scores = []
                        dataStore.studyPlans = []
                        dataStore.goals = []
                        dataStore.saveToLocal()
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                                .foregroundStyle(.red)
                            Text("Reset All Data")
                                .foregroundStyle(.red)
                        }
                    }
                }

                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("0.1.0")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Build")
                        Spacer()
                        Text("iOS App")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

struct TargetBandRow: View {
    let skill: Skill
    @EnvironmentObject var dataStore: DataStore
    @State private var targetBand: Double

    init(skill: Skill) {
        self.skill = skill
        _targetBand = State(initialValue: skill.targetBand)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(skill.icon)
                Text(skill.name)
                    .font(.headline)
                Spacer()
                Text(String(format: "%.1f", targetBand))
                    .font(.headline)
                    .foregroundStyle(Color(hex: skill.color))
            }

            Slider(value: $targetBand, in: 4...9, step: 0.5)
                .tint(Color(hex: skill.color))
                .onChange(of: targetBand) { _, newValue in
                    let updated = Skill(
                        id: skill.id,
                        name: skill.name,
                        icon: skill.icon,
                        targetBand: newValue,
                        color: skill.color
                    )
                    dataStore.updateSkill(updated)
                }
        }
        .padding(.vertical, 4)
    }
}