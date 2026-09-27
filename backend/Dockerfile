# ---------- Stage 1: build ----------
FROM eclipse-temurin:21 AS build
WORKDIR /workspace

# pom.xml + mvnw are copied on their own so the dependency-resolving layer
# stays cached until the build actually changes.
COPY pom.xml mvnw ./

# This repo ships mvnw but no .mvn/wrapper/maven-wrapper.properties, and mvnw
# hard-exits without it ("cannot read distributionUrl property" - mvnw:115).
# Recreate it inside the image only; no repository file is modified.
RUN chmod +x mvnw \
 && mkdir -p .mvn/wrapper \
 && printf '%s\n' \
      'distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip' \
      > .mvn/wrapper/maven-wrapper.properties

COPY src ./src

# Maven comes from the wrapper, per the project's own build command.
RUN ./mvnw clean package -DskipTests

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Single-module build -> exactly one repackaged Spring Boot jar in target/.
# Wildcard keeps this working if the version in pom.xml is bumped.
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
