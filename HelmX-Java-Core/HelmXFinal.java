import java.util.*;
import java.io.*;
import java.net.*;
import java.sql.*;

// 1. CONSTRUCTORS & METHOD OVERRIDING
abstract class TelemetrySensor {
    protected String sensorId;
    public TelemetrySensor(String sensorId) { this.sensorId = sensorId; }
    public abstract String readTelemetry();
}

class OreSensor extends TelemetrySensor {
    public OreSensor(String id) { super(id); }
    @Override
    public String readTelemetry() { return "[" + sensorId + "] Gold Anomaly: 0.12% Au"; }
}

// 2. MULTITHREADING (Normal Sensor Thread + MAX_PRIORITY SOS Thread)
class TelemetryWorker extends Thread {
    private TelemetrySensor sensor;
    public TelemetryWorker(TelemetrySensor sensor) { this.sensor = sensor; }
    @Override
    public void run() {
        System.out.println(getName() + " -> " + sensor.readTelemetry());
    }
}

public class HelmXFinal {
    // 3. COLLECTIONS & GENERICS
    private static Map<String, String> helmetAuthMap = new HashMap<>();
    private static List<String> shoppingCart = new ArrayList<>();

    // 4. JDBC (Database Login Authentication)
    public static boolean authenticateViaJDBC(String unitId, String password) {
        String url = "jdbc:mysql://localhost:3306/helmx_db";
        String query = "SELECT * FROM helmets WHERE unit_id = ? AND access_pass = ?";
        try (Connection conn = DriverManager.getConnection(url, "root", "admin");
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, unitId);
            stmt.setString(2, password);
            return stmt.executeQuery().next();
        } catch (SQLException e) {
            return password.equals(helmetAuthMap.get(unitId));
        }
    }

    // 5. NETWORKING (Socket Server for Live Telemetry)
    public static void startTelemetryServer(int port) {
        new Thread(() -> {
            try (ServerSocket server = new ServerSocket(port)) {
                Socket client = server.accept();
                new PrintWriter(client.getOutputStream(), true).println("HELMX STREAM ONLINE");
            } catch (IOException e) { System.out.println("[NET] Server stopped."); }
        }).start();
    }

    // 6. FILE I/O (Exporting Shift Log CSV)
    public static void exportShiftLog(String unitId, String data) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("ShiftLog_" + unitId + ".csv", true))) {
            writer.write(unitId + "," + data);
            writer.newLine();
            System.out.println("[FILE I/O] Shift log saved for " + unitId);
        } catch (IOException e) { System.out.println("[FILE I/O] Write failed."); }
    }

    public static void main(String[] args) {
        helmetAuthMap.put("HX-8492", "mine123");
        shoppingCart.add("HelmX Pro (₹5000)");

        // Normal Sensor Thread
        TelemetryWorker oreThread = new TelemetryWorker(new OreSensor("SPEC-09"));
        oreThread.setName("OreScanner-Thread");

        // High-Priority SOS Thread
        Thread sosThread = new Thread(() -> System.out.println("[SOS] PRIORITY-10 ALERT DISPATCHED!"));
        sosThread.setPriority(Thread.MAX_PRIORITY);

        oreThread.start();
        sosThread.start();
        exportShiftLog("HX-8492", "O2:20.8%,CO:4.2ppm,Au:0.12%");
    }
}