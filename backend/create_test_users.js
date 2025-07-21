const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

async function createTestUsers() {
  console.log("🚀 Creating test users...");

  const dbPath = path.join(__dirname, "database", "sqlite.db");
  const db = new sqlite3.Database(dbPath);

  const testUsers = [
    {
      email: "test1@test.com",
      name: "Test User 1",
      username: "testuser1",
      password: "1234",
      avatarUrl: "/files/avatar.png",
      isTwoFactorEnabled: false,
    },
    {
      email: "test2@test.com",
      name: "Test User 2",
      username: "testuser2",
      password: "1234",
      avatarUrl: "/files/avatar.png",
      isTwoFactorEnabled: false,
    },
    {
      email: "test3@test.com",
      name: "Test User 3",
      username: "testuser3",
      password: "1234",
      avatarUrl: "/files/avatar.png",
      isTwoFactorEnabled: false,
    },
    {
      email: "test4@test.com",
      name: "Test User 4",
      username: "testuser4",
      password: "1234",
      avatarUrl: "/files/avatar.png",
      isTwoFactorEnabled: false,
    },
  ];

  try {
    // 테이블이 있는지 확인
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
      (err, row) => {
        if (err) {
          console.error("❌ Error checking table:", err);
          return;
        }

        if (!row) {
          console.log("❌ Users table not found. Please run migrations first.");
          return;
        }

        console.log("✅ Users table found, creating test users...");

        // 각 유저 생성
        testUsers.forEach((userData, index) => {
          bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
            if (err) {
              console.error(
                `❌ Error hashing password for ${userData.email}:`,
                err
              );
              return;
            }

            const now = new Date().toISOString();
            const sql = `
            INSERT INTO users (id, email, name, username, password_hash, avatar_url, is_two_factor_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

            const userId = `test-user-${index + 1}`;

            db.run(
              sql,
              [
                userId,
                userData.email,
                userData.name,
                userData.username,
                hashedPassword,
                userData.avatarUrl,
                userData.isTwoFactorEnabled ? 1 : 0,
                now,
                now,
              ],
              function (err) {
                if (err) {
                  console.error(
                    `❌ Error creating user ${userData.email}:`,
                    err
                  );
                } else {
                  console.log(
                    `✅ Created user: ${userData.email} (${userData.username})`
                  );
                }

                // 마지막 유저가 완료되면 요약 출력
                if (index === testUsers.length - 1) {
                  setTimeout(() => {
                    console.log("\n🎉 All test users created successfully!");
                    console.log("\n📋 Test Users:");
                    testUsers.forEach((user) => {
                      console.log(`   Email: ${user.email}`);
                      console.log(`   Username: ${user.username}`);
                      console.log(`   Password: ${user.password}`);
                      console.log("   ---");
                    });
                    db.close();
                  }, 1000);
                }
              }
            );
          });
        });
      }
    );
  } catch (error) {
    console.error("❌ Error creating test users:", error);
    db.close();
  }
}

createTestUsers();
