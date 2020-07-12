import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import CompareNoise from "@/views/CompareNoise";
import Sequencer from "@/views/Sequencer";
import Sequencer2 from "@/views/Sequencer2";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/compare_noise",
    name: "CompareNoise",
    component: CompareNoise
  },
  {
    path: "/sequencer",
    name: "Sequencer",
    component: Sequencer
  },
  {
    path: "/sequencer2",
    name: "Sequencer2",
    component: Sequencer2
  }
];

const router = new VueRouter({
  routes
});

export default router;
