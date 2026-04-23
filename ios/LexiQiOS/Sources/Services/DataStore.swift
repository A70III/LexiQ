import Foundation
import SwiftUI

@MainActor
class DataStore: ObservableObject {
    static let shared = DataStore()

    @Published var skills: [Skill] = []
    @Published var courses: [Course] = []
    @Published var scores: [ScoreRecord] = []
    @Published var studyPlans: [StudyPlan] = []
    @Published var goals: [Goal] = []
    @Published var isLoading = false
    @Published var isSyncing = false
    @Published var lastSyncDate: Date?
    @Published var serverAddress: String = ""
    @Published var errorMessage: String?

    private let storageKey = "lexiq_app_data"

    private init() {
        loadFromLocal()
    }

    func loadFromLocal() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let appData = try? JSONDecoder().decode(AppData.self, from: data) {
            self.skills = appData.skills
            self.courses = appData.courses
            self.scores = appData.scores
            self.studyPlans = appData.studyPlans ?? []
            self.goals = appData.goals ?? []
        } else {
            let defaults = AppData.empty
            self.skills = defaults.skills
            self.courses = defaults.courses
            self.scores = defaults.scores
            self.studyPlans = defaults.studyPlans
            self.goals = defaults.goals
        }
    }

    func saveToLocal() {
        let appData = AppData(
            skills: skills,
            courses: courses,
            scores: scores,
            studyPlans: studyPlans,
            goals: goals
        )
        if let data = try? JSONEncoder().encode(appData) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    func syncFromMac() async {
        guard !serverAddress.isEmpty else {
            errorMessage = "Please enter Mac server address first"
            return
        }

        isSyncing = true
        errorMessage = nil

        do {
            await SyncService.shared.setServerAddress(serverAddress)
            let data = try await SyncService.shared.fetchData()
            skills = data.skills
            courses = data.courses
            scores = data.scores
            studyPlans = data.studyPlans ?? []
            goals = data.goals ?? []
            lastSyncDate = Date()
            saveToLocal()
        } catch {
            errorMessage = error.localizedDescription
        }

        isSyncing = false
    }

    func syncToMac() async {
        guard !serverAddress.isEmpty else {
            errorMessage = "Please enter Mac server address first"
            return
        }

        isSyncing = true
        errorMessage = nil

        do {
            await SyncService.shared.setServerAddress(serverAddress)
            let appData = AppData(
                skills: skills,
                courses: courses,
                scores: scores,
                studyPlans: studyPlans,
                goals: goals
            )
            let _ = try await SyncService.shared.pushData(appData)
            lastSyncDate = Date()
        } catch {
            errorMessage = error.localizedDescription
        }

        isSyncing = false
    }

    func addSkill(_ skill: Skill) {
        skills.append(skill)
        saveToLocal()
    }

    func updateSkill(_ skill: Skill) {
        if let index = skills.firstIndex(where: { $0.id == skill.id }) {
            skills[index] = skill
            saveToLocal()
        }
    }

    func deleteSkill(_ skill: Skill) {
        skills.removeAll { $0.id == skill.id }
        courses.removeAll { $0.skillId == skill.id }
        scores.removeAll { $0.skillId == skill.id }
        studyPlans.removeAll { $0.skillId == skill.id }
        goals.removeAll { $0.skillId == skill.id }
        saveToLocal()
    }

    func addCourse(_ course: Course) {
        courses.append(course)
        saveToLocal()
    }

    func updateCourse(_ course: Course) {
        if let index = courses.firstIndex(where: { $0.id == course.id }) {
            courses[index] = course
            saveToLocal()
        }
    }

    func deleteCourse(_ course: Course) {
        courses.removeAll { $0.id == course.id }
        studyPlans.removeAll { $0.courseId == course.id }
        saveToLocal()
    }

    func addScore(_ score: ScoreRecord) {
        scores.append(score)
        saveToLocal()
    }

    func deleteScore(_ score: ScoreRecord) {
        scores.removeAll { $0.id == score.id }
        saveToLocal()
    }

    func addStudyPlan(_ plan: StudyPlan) {
        studyPlans.append(plan)
        saveToLocal()
    }

    func updateStudyPlan(_ plan: StudyPlan) {
        if let index = studyPlans.firstIndex(where: { $0.id == plan.id }) {
            studyPlans[index] = plan
            saveToLocal()
        }
    }

    func deleteStudyPlan(_ plan: StudyPlan) {
        studyPlans.removeAll { $0.id == plan.id }
        saveToLocal()
    }

    func getSkill(by id: String) -> Skill? {
        skills.first { $0.id == id }
    }

    func getCourses(for skillId: String) -> [Course] {
        courses.filter { $0.skillId == skillId }
    }

    func getScores(for skillId: String) -> [ScoreRecord] {
        scores.filter { $0.skillId == skillId }
    }

    func getStudyPlans(for date: String) -> [StudyPlan] {
        studyPlans.filter { $0.date == date }
    }

    func getLatestScore(for skillId: String) -> ScoreRecord? {
        scores.filter { $0.skillId == skillId }
            .sorted { $0.date > $1.date }
            .first
    }
}