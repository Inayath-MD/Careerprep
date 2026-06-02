FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the generated JAR file into the container
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
