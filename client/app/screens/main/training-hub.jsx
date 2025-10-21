import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { useEffect, useContext, useState } from "react";
import { router } from "expo-router";
import { routes, } from "../../common/settings/constants";
import { colors, nutritionColors } from "../../common/settings/styling";
import AppText from "../../components/screen-comps/app-text";
import { scaleFont } from "../../common/utils/scale-fonts";
import { UserContext } from "../../common/contexts/user-context";
import { Image } from "expo-image";
import { Images } from "../../common/settings/assets";
import { convertEnergy, convertFluid } from "../../common/utils/unit-converter";
import { formatDate } from "../../common/utils/date-time";
import usePopups from "../../common/hooks/use-popups";
import { totalDayConsumption } from "../../common/utils/metrics-calculator";
import APIService from "../../common/services/api-service";
import FloatingActionMenu from "../../components/screen-comps/floating-action-menu";
import ProgressBar from "../../components/screen-comps/progress-bar";
import DateDisplay from "../../components/screen-comps/date-display";
import AppScroll from "../../components/screen-comps/app-scroll";
import Divider from "../../components/screen-comps/divider";

export default function TrainingHub() {
     const { showSpinner, hideSpinner, createToast } = usePopups();
     const { user, setUser } = useContext(UserContext);

     const [consumedEnergy, setConsumedEnergy] = useState(0);
     const [exercises, setExercises] = useState([]);
     const [totalEnergy, setTotalEnergy] = useState(0);
     const [totalExercises, setTotalExercises] = useState(0);

     useEffect(() => {
          async function prepareData() {
               try {
                    showSpinner();

                    const result = await APIService.training.exercises.exercisesByDate(new Date());

                    if (result.success) {
                         const exercises = result.data.exercises;
                         const exercisesTotal = exercises.length;
                         const energyTotal = Math.round(
                              exercises.reduce((total, ex) => {
                                   const totalReps = ex.sets.reduce((sum, set) => sum + set.reps, 0);
                                   const units = totalReps / 5;
                                   const exerciseKCal = (ex.exercise.kCalBurned || 0) * units;
                                   return total + exerciseKCal;
                              }, 0)
                         );

                         setExercises(exercises);
                         setTotalEnergy(energyTotal);
                         setTotalExercises(exercisesTotal);
                    }

                    const date = formatDate(new Date(), { format: "YYYY-MM-DD" });
                    const nutritionLog = user.nutritionLogs[date];
                    const { energyKcal } = totalDayConsumption(nutritionLog);
                    setConsumedEnergy(energyKcal || 0);
               } catch (err) {
                    console.log(err);
               } finally {
                    hideSpinner();
               }
          }

          prepareData();
     }, []);

     function handleWorkoutPlans() {
          router.push({
               pathname: routes.WORKOUTS,
               params: {
                    workoutsContext: 'normal'
               }
          });
     }

     return (
          <AppScroll extraBottom={150} extraTop={0} hideNavBarOnScroll={true}>
               {/* Header Section */}
               <View style={styles.header}>
                    <View style={styles.headerTop}>
                         <AppText style={styles.headerTitle}>
                              Training Summary
                         </AppText>
                         <View style={styles.dateContainer}>
                              <DateDisplay
                                   showDay={false}
                                   dateStyle={styles.dateText}
                                   uppercaseDate={false}
                              />
                         </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsGrid}>
                         <View style={styles.statItem}>
                              <AppText style={styles.statValue}>{totalExercises}</AppText>
                              <AppText style={styles.statLabel}>Exercises</AppText>
                         </View>
                         <View style={styles.statItem}>
                              <AppText style={styles.statValue}>
                                   {convertEnergy(totalEnergy || 0, 'kcal', user.preferences.energyUnit.key)}
                              </AppText>
                              <AppText style={styles.statLabel}>Burned</AppText>
                         </View>
                         <View style={styles.statItem}>
                              <AppText style={styles.statValue}>
                                   {convertEnergy(consumedEnergy, 'kcal', user.preferences.energyUnit.key)}
                              </AppText>
                              <AppText style={styles.statLabel}>Consumed</AppText>
                         </View>
                    </View>
               </View>

               {/* MAIN FEATURE - Workouts Log Hero Card */}
               <View style={styles.mainSection}>
                    <TouchableOpacity
                         onPress={() => router.push(routes.WORKOUTS_LOG)}
                         style={styles.heroCard}
                    >
                         <View style={styles.heroBackground}>
                              <View style={styles.heroContent}>
                                   <View style={styles.heroIconContainer}>
                                        <Image
                                             source={Images.workoutLogOutline}
                                             style={styles.heroIcon}
                                        />
                                   </View>
                                   <View style={styles.heroText}>
                                        <AppText style={styles.heroTitle}>Workouts Log</AppText>
                                        <AppText style={styles.heroSubtitle}>
                                             Track, analyze, and optimize your fitness journey
                                        </AppText>
                                   </View>
                                   <View>
                                        <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} />
                                   </View>
                              </View>
                              <View style={styles.heroStats}>
                                   <View style={styles.heroStat}>
                                        <AppText style={styles.heroStatValue}>12</AppText>
                                        <AppText style={styles.heroStatLabel}>This Week</AppText>
                                   </View>
                                   <View style={styles.heroStat}>
                                        <AppText style={styles.heroStatValue}>47</AppText>
                                        <AppText style={styles.heroStatLabel}>This Month</AppText>
                                   </View>
                                   <View style={styles.heroStat}>
                                        <AppText style={styles.heroStatValue}>98%</AppText>
                                        <AppText style={styles.heroStatLabel}>Consistency</AppText>
                                   </View>
                              </View>
                         </View>
                    </TouchableOpacity>
               </View>

               {/* Training Tools Section */}
               <View style={styles.toolsSection}>
                    <AppText style={styles.sectionTitle}>Training Tools</AppText>

                    <View style={styles.toolsGrid}>
                         {/* Workout Plans */}
                         <TouchableOpacity
                              onPress={handleWorkoutPlans}
                              style={styles.toolCard}
                         >
                              <View style={[styles.toolIcon, styles.plansIcon]}>
                                   <Image
                                        source={Images.workoutPlanOutline}
                                        style={styles.toolIconImage}
                                   />
                              </View>
                              <AppText style={styles.toolTitle}>Workout Plans</AppText>
                              <AppText style={styles.toolDescription}>
                                   Create custom workout routines
                              </AppText>
                         </TouchableOpacity>

                         {/* Progress Photos */}
                         <TouchableOpacity
                              onPress={() => { }}
                              style={styles.toolCard}
                         >
                              <View style={[styles.toolIcon, styles.photosIcon]}>
                                   <Image
                                        source={Images.camera}
                                        style={styles.toolIconImage}
                                   />
                              </View>
                              <AppText style={styles.toolTitle}>Progress Photos</AppText>
                              <AppText style={styles.toolDescription}>
                                   Visual transformation tracking
                              </AppText>
                         </TouchableOpacity>

                         {/* Body Metrics */}
                         <TouchableOpacity
                              onPress={() => { }}
                              style={styles.toolCard}
                         >
                              <View style={[styles.toolIcon, styles.metricsIcon]}>
                                   <Image
                                        source={Images.measuringTape}
                                        style={styles.toolIconImage}
                                   />
                              </View>
                              <AppText style={styles.toolTitle}>Body Metrics</AppText>
                              <AppText style={styles.toolDescription}>
                                   Track measurements & weight
                              </AppText>
                         </TouchableOpacity>

                         <TouchableOpacity
                              onPress={() => router.push(routes.EXERCISES_LIST)}
                              style={styles.toolCard}
                         >
                              <View style={[styles.toolIcon, styles.libraryIcon]}>
                                   <Image
                                        source={Images.icon6}
                                        style={styles.toolIconImage}
                                   />
                              </View>
                              <AppText style={styles.toolTitle}>Exercise Library</AppText>
                              <AppText style={styles.toolDescription}>
                                   200+ exercises with guides
                              </AppText>
                         </TouchableOpacity>
                    </View>
               </View>

               {/* Quick Actions */}
               <View style={styles.actionsSection}>
                    <AppText style={styles.sectionTitle}>Quick Actions</AppText>

                    <View style={styles.actionsRow}>
                         <TouchableOpacity style={styles.actionButton}>
                              <Image
                                   source={Images.plus}
                                   style={styles.actionIcon}
                              />
                              <AppText style={styles.actionText}>New Workout</AppText>
                         </TouchableOpacity>

                         <TouchableOpacity style={styles.actionButton}>
                              <Image
                                   source={Images.checkMark}
                                   style={styles.actionIcon}
                              />
                              <AppText style={styles.actionText}>Progress</AppText>
                         </TouchableOpacity>

                         <TouchableOpacity style={styles.actionButton}>
                              <Image
                                   source={Images.share}
                                   style={styles.actionIcon}
                              />
                              <AppText style={styles.actionText}>Share</AppText>
                         </TouchableOpacity>
                    </View>
               </View>
          </AppScroll>
     );
}
const styles = StyleSheet.create({
     // Header Styles
     header: {
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,
          borderBottomEndRadius: 30,
          borderBottomStartRadius: 30,
          backgroundColor: colors.cardBackground,
     },
     headerTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 25,
     },
     headerTitle: {
          fontSize: scaleFont(18),
          color: colors.white,
          fontWeight: 'bold',
     },
     dateText: {
          fontSize: scaleFont(14),
          color: colors.mutedText,
     },

     // Stats Grid
     statsGrid: {
          flexDirection: 'row',
          justifyContent: 'space-between',
     },
     statItem: {
          alignItems: 'center',
          flex: 1,
     },
     statValue: {
          fontSize: scaleFont(20),
          fontWeight: '800',
          color: colors.white,
          marginBottom: 4,
     },
     statLabel: {
          fontSize: scaleFont(12),
          color: colors.mutedText,
     },

     // Main Hero Section
     mainSection: {
          paddingHorizontal: 20,
          paddingTop: 25,
     },
     heroCard: {
          backgroundColor: 'linear-gradient(135deg, rgba(74, 144, 226, 0.3) 0%, rgba(101, 83, 240, 0.3) 100%)',
          borderRadius: 25,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
     },
     heroBackground: {
          padding: 25,
     },
     heroContent: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
     },
     heroIconContainer: {
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 16,
          padding: 16,
          marginRight: 15,
     },
     heroIcon: {
          width: 32,
          height: 32,
          tintColor: 'white',
     },
     heroText: {
          flex: 1,
     },
     heroTitle: {
          fontSize: scaleFont(24),
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 4,
     },
     heroSubtitle: {
          fontSize: scaleFont(13),
          color: 'rgba(255,255,255,0.8)',
     },
     heroBadge: {
          backgroundColor: '#FF6B6B',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
     },
     heroBadgeText: {
          fontSize: scaleFont(10),
          color: 'white',
          fontWeight: 'bold',
     },
     heroStats: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          paddingTop: 20,
     },
     heroStat: {
          alignItems: 'center',
     },
     heroStatValue: {
          fontSize: scaleFont(18),
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 2,
     },
     heroStatLabel: {
          fontSize: scaleFont(11),
          color: 'rgba(255,255,255,0.7)',
     },

     // Training Tools Section
     toolsSection: {
          paddingHorizontal: 20,
          paddingTop: 30,
     },
     sectionTitle: {
          fontSize: scaleFont(18),
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 15,
     },
     toolsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
     },
     toolCard: {
          width: '48%',
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          alignItems: 'center',
     },
     toolIcon: {
          width: 50,
          height: 50,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 8,
          backgroundColor: colors.backgroundTop,
          borderRadius: 10
     },
     toolIconImage: {
          width: 24,
          height: 24,
          tintColor: 'white',
     },
     toolTitle: {
          fontSize: scaleFont(14),
          fontWeight: '600',
          color: 'white',
          textAlign: 'center',
          marginBottom: 4,
     },
     toolDescription: {
          fontSize: scaleFont(10),
          color: colors.mutedText,
          textAlign: 'center',
     },

     // Quick Actions
     actionsSection: {
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 30,
     },
     actionsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
     },
     actionButton: {
          flex: 1,
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          padding: 12,
          alignItems: 'center',
          marginHorizontal: 4,
     },
     actionIcon: {
          width: 20,
          height: 20,
          tintColor: 'white',
          marginBottom: 6,
     },
     actionText: {
          fontSize: scaleFont(11),
          color: 'white',
          fontWeight: '500',
     },
});