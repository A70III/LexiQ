import Foundation

enum SyncError: Error, LocalizedError {
    case networkError(String)
    case serverNotFound
    case invalidResponse
    case encodingError

    var errorDescription: String? {
        switch self {
        case .networkError(let msg): return "Network error: \(msg)"
        case .serverNotFound: return "Cannot connect to Mac. Make sure LexiQ is running."
        case .invalidResponse: return "Invalid response from server"
        case .encodingError: return "Failed to encode/decode data"
        }
    }
}

actor SyncService {
    static let shared = SyncService()

    private var serverAddress: String = ""
    private var lastSyncDate: Date?

    private init() {}

    func setServerAddress(_ address: String) {
        self.serverAddress = address
    }

    func getServerAddress() -> String {
        return serverAddress
    }

    func fetchData() async throws -> AppData {
        guard !serverAddress.isEmpty else {
            throw SyncError.serverNotFound
        }

        guard let url = URL(string: "\(serverAddress)/api/data") else {
            throw SyncError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 10

        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw SyncError.invalidResponse
            }

            let decoder = JSONDecoder()
            let appData = try decoder.decode(AppData.self, from: data)
            lastSyncDate = Date()
            return appData
        } catch let error as SyncError {
            throw error
        } catch {
            throw SyncError.networkError(error.localizedDescription)
        }
    }

    func pushData(_ data: AppData) async throws -> AppData {
        guard !serverAddress.isEmpty else {
            throw SyncError.serverNotFound
        }

        guard let url = URL(string: "\(serverAddress)/api/data") else {
            throw SyncError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10

        do {
            let encoder = JSONEncoder()
            request.httpBody = try encoder.encode(data)

            let (responseData, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw SyncError.invalidResponse
            }

            let decoder = JSONDecoder()
            let appData = try decoder.decode(AppData.self, from: responseData)
            lastSyncDate = Date()
            return appData
        } catch let error as SyncError {
            throw error
        } catch {
            throw SyncError.networkError(error.localizedDescription)
        }
    }

    func checkConnection() async -> Bool {
        guard !serverAddress.isEmpty,
              let url = URL(string: "\(serverAddress)/api/status") else {
            return false
        }

        do {
            let (_, response) = try await URLSession.shared.data(from: url)
            guard let httpResponse = response as? HTTPURLResponse else { return false }
            return (200...299).contains(httpResponse.statusCode)
        } catch {
            return false
        }
    }

    func getLastSyncDate() -> Date? {
        return lastSyncDate
    }
}