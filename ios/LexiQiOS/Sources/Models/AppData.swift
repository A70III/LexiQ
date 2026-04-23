import Foundation

struct Skill: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var icon: String
    var targetBand: Double
    var color: String
}

struct Course: Codable, Identifiable, Equatable {
    let id: String
    var title: String
    var skillId: String
    var totalLessons: Int
    var completedLessons: Int
    var source: String?
    var notes: String?
    var createdAt: String
}

struct ScoreRecord: Codable, Identifiable, Equatable {
    let id: String
    var skillId: String
    var band: Double
    var date: String
    var testName: String?
    var notes: String?
}

struct StudyPlan: Codable, Identifiable, Equatable {
    let id: String
    var title: String
    var skillId: String
    var courseId: String?
    var date: String
    var completed: Bool
    var notes: String?
    var createdAt: String
}

struct Goal: Codable, Identifiable, Equatable {
    let id: String
    var skillId: String
    var targetBand: Double
    var targetDate: String
    var achieved: Bool
    var achievedDate: String?
    var createdAt: String
}

struct AppData: Codable {
    var skills: [Skill]
    var courses: [Course]
    var scores: [ScoreRecord]
    var studyPlans: [StudyPlan]
    var goals: [Goal]
}

extension AppData {
    static var empty: AppData {
        AppData(
            skills: [
                Skill(id: "listening", name: "Listening", icon: "🎧", targetBand: 7, color: "#007AFF"),
                Skill(id: "reading", name: "Reading", icon: "📖", targetBand: 7, color: "#34C759"),
                Skill(id: "writing", name: "Writing", icon: "✍️", targetBand: 7, color: "#FF9500"),
                Skill(id: "speaking", name: "Speaking", icon: "🎤", targetBand: 7, color: "#FF2D55")
            ],
            courses: [],
            scores: [],
            studyPlans: [],
            goals: []
        )
    }
}